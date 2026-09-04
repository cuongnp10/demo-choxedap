import React from 'react';
import { MessageSquare, User } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { formatRelativeTime } from '../../lib/utils';

export const ChatDropdown: React.FC = () => {
  const { conversations, openPeerChat, closeChatDropdown, markAllMessagesAsRead } = useChat();

  const handleConversationClick = (conv: any) => {
    openPeerChat({
      id: conv.otherUser.id.toString(),
      name: conv.otherUser.fullName,
      avatar: conv.otherUser.avatar
    });
    closeChatDropdown();
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
      <div className="p-4 border-b border-gray-50 flex items-center justify-between">
        <h3 className="font-bold text-gray-800">Tin nhắn</h3>
        <span 
          onClick={() => markAllMessagesAsRead()}
          className="text-xs text-[#2E9147] font-medium cursor-pointer hover:underline"
        >
          Xem tất cả
        </span>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {conversations.length > 0 ? (
          conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => handleConversationClick(conv)}
              className="p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                  {conv.otherUser.avatar ? (
                    <img src={conv.otherUser.avatar} alt={conv.otherUser.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <User size={24} className="text-gray-400" />
                  )}
                </div>
                {conv.unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-bold">
                    {conv.unreadCount}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h4 className="font-bold text-sm text-gray-900 truncate">
                    {conv.otherUser.fullName}
                  </h4>
                  <span className="text-[10px] text-gray-400">
                    {formatRelativeTime(conv.lastMessageAt)}
                  </span>
                </div>
                <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                  {conv.unreadCount > 0 ? `Bạn có ${conv.unreadCount} tin nhắn mới` : 'Nhấn để trò chuyện'}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageSquare size={24} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-500">Chưa có cuộc hội thoại nào</p>
          </div>
        )}
      </div>
    </div>
  );
};
