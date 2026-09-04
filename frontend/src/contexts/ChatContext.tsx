import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuth } from './AuthContext';
import { chatApi } from '../lib/api';

export type UserChatData = {
  id: string; // to uniquely identify peer chats
  name: string;
  avatar?: string;
};

export type MessageData = {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  createdAt: string;
  isRead: boolean;
};

export type ConversationData = {
  id: number;
  otherUser: {
    id: number;
    fullName: string;
    avatar?: string;
  };
  lastMessageAt: string;
  unreadCount: number;
};

interface ChatContextType {
  // Support chat state
  isSupportOpen: boolean;
  openSupportChat: () => void;
  closeSupportChat: () => void;
  toggleSupportChat: () => void;

  // Peer chats state
  activeChats: UserChatData[];
  openPeerChat: (user: UserChatData, initialMessage?: string) => void;
  closePeerChat: (userId: string) => void;

  // Real-time messaging
  messages: Record<string, MessageData[]>; // conversationId -> messages
  conversations: ConversationData[];
  sendMessage: (receiverId: number, content: string) => Promise<void>;
  loadMessages: (conversationId: number) => Promise<void>;
  loadConversations: () => Promise<void>;
  markAllMessagesAsRead: () => Promise<void>;
  totalUnreadCount: number;

  // Overall toggle logic for UI
  isChatDropdownOpen: boolean;
  toggleChatDropdown: () => void;
  closeChatDropdown: () => void;
  
  // New: Current user's chat ID helper
  getConversationWithUser: (userId: string) => ConversationData | undefined;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [activeChats, setActiveChats] = useState<UserChatData[]>([]);
  const [isChatDropdownOpen, setIsChatDropdownOpen] = useState(false);

  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [messages, setMessages] = useState<Record<string, MessageData[]>>({});
  const [pendingInitialMessages, setPendingInitialMessages] = useState<Record<string, string>>({}); // userId -> message

  const totalUnreadCount = conversations.reduce((acc, conv) => acc + conv.unreadCount, 0);

  // --- SignalR Setup ---
  useEffect(() => {
    if (isAuthenticated && !connection) {
      const token = localStorage.getItem("choxedap_token");
      const newConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${import.meta.env.VITE_API_URL}/chatHub`, {
          accessTokenFactory: () => token || ""
        })
        .withAutomaticReconnect()
        .build();

      newConnection.start()
        .then(() => {
          console.log("Connected to SignalR ChatHub");
          setConnection(newConnection);
        })
        .catch(err => console.error("SignalR Connection Error: ", err));

      newConnection.on("ReceiveMessage", (message: any) => {
        // Handle both PascalCase (from older BE) and camelCase (from newer BE)
        const normalizedMessage: MessageData = {
          id: message.id ?? message.Id,
          conversationId: message.conversationId ?? message.ConversationId,
          senderId: message.senderId ?? message.SenderId,
          content: message.content ?? message.Content,
          createdAt: message.createdAt ?? message.CreatedAt,
          isRead: message.isRead ?? message.IsRead
        };

        setMessages(prev => {
          const convId = normalizedMessage.conversationId.toString();
          const existing = prev[convId] || [];
          if (existing.find(m => m.id === normalizedMessage.id)) return prev;
          return {
            ...prev,
            [convId]: [...existing, normalizedMessage]
          };
        });
        
        // Refresh conversations to update unread counts and sorting
        loadConversations();
      });

      return () => {
        newConnection.stop();
      };
    } else if (!isAuthenticated && connection) {
      connection.stop();
      setConnection(null);
    }
  }, [isAuthenticated]);

  // --- Data Fetching ---
  const loadConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await chatApi.getConversations();
      setConversations(data);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  }, [isAuthenticated]);

  const markAllMessagesAsRead = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      await chatApi.markAllRead();
      setConversations(prev => prev.map(c => ({ ...c, unreadCount: 0 })));
    } catch (err) {
      console.error("Failed to mark all messages as read:", err);
    }
  }, [isAuthenticated]);

  const loadMessages = useCallback(async (conversationId: number) => {
    try {
      const data = await chatApi.getMessages(conversationId);
      setMessages(prev => ({
        ...prev,
        [conversationId.toString()]: data
      }));
      
      // Update unread count locally
      setConversations(prev => prev.map(c => 
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      ));
    } catch (err) {
      console.error(`Failed to load messages for conversation ${conversationId}:`, err);
    }
  }, []);

  const sendMessage = async (receiverId: number, content: string) => {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
      try {
        await connection.invoke("SendMessage", receiverId, content);
      } catch (err) {
        console.error("SendMessage Error: ", err);
      }
    } else {
      console.error("SignalR not connected");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    }
  }, [isAuthenticated, loadConversations]);

  // --- Handle Pending Initial Messages ---
  useEffect(() => {
    if (connection && connection.state === signalR.HubConnectionState.Connected && Object.keys(pendingInitialMessages).length > 0) {
      const usersToChat = Object.keys(pendingInitialMessages);
      usersToChat.forEach(async (userId) => {
        const message = pendingInitialMessages[userId];
        await sendMessage(parseInt(userId), message);
        setPendingInitialMessages(prev => {
          const next = { ...prev };
          delete next[userId];
          return next;
        });
      });
    }
  }, [connection, pendingInitialMessages]);

  // --- Support Chat Logic ---
  const openSupportChat = () => setIsSupportOpen(true);
  const closeSupportChat = () => setIsSupportOpen(false);
  const toggleSupportChat = () => setIsSupportOpen((prev) => !prev);

  // --- Peer Chat Logic ---
  const openPeerChat = (user: UserChatData, initialMessage?: string) => {
    setActiveChats((prev) => {
      if (prev.find(c => c.id === user.id)) return prev;
      const newChats = [...prev, user];
      if (newChats.length > 3) return newChats.slice(1);
      return newChats;
    });
    
    // Check if we have a conversation for this user
    const conv = getConversationWithUser(user.id);
    if (conv) {
      loadMessages(conv.id);
      if (initialMessage) {
        sendMessage(parseInt(user.id), initialMessage);
      }
    } else if (initialMessage) {
      // If no conversation yet, queue the message
      setPendingInitialMessages(prev => ({
        ...prev,
        [user.id]: initialMessage
      }));
    }
  };

  const closePeerChat = (userId: string) => {
    setActiveChats((prev) => prev.filter(c => c.id !== userId));
  };

  const getConversationWithUser = (userId: string) => {
    return conversations.find(c => c.otherUser.id.toString() === userId);
  };

  // --- Dropdown Logic ---
  const toggleChatDropdown = () => {
    setIsChatDropdownOpen(prev => !prev);
    if (!isChatDropdownOpen) {
      loadConversations();
    }
  };
  const closeChatDropdown = () => setIsChatDropdownOpen(false);

  return (
    <ChatContext.Provider value={{
      isSupportOpen, openSupportChat, closeSupportChat, toggleSupportChat,
      activeChats, openPeerChat, closePeerChat,
      messages, conversations, sendMessage, loadMessages, loadConversations,
      markAllMessagesAsRead,
      totalUnreadCount,
      isChatDropdownOpen, toggleChatDropdown, closeChatDropdown,
      getConversationWithUser
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
