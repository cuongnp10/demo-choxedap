import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, User, Bot, Loader2 } from 'lucide-react';
import type { UserChatData, MessageData } from '../../contexts/ChatContext';
import { aiApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';

interface ChatWindowProps {
    type: 'support' | 'peer';
    user?: UserChatData;
    onClose: () => void;
    zIndex: number;
}

export function ChatWindow({ type, user, onClose, zIndex }: ChatWindowProps) {
    const { user: currentUser } = useAuth();
    const { messages: allMessages, sendMessage, loadMessages, getConversationWithUser } = useChat();
    const [message, setMessage] = useState("");
    const [localMessages, setLocalMessages] = useState<{ id: number, text: string, sender: string, time: string }[]>([]);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const conversation = type === 'peer' && user ? getConversationWithUser(user.id) : null;
    const conversationMessages = conversation ? allMessages[conversation.id.toString()] : [];

    useEffect(() => {
        if (type === 'peer' && user) {
            if (conversation) {
                loadMessages(conversation.id);
            }
        } else if (type === 'support') {
            if (currentUser) {
                loadAiHistory();
            } else {
                setLocalMessages([
                    { id: 1, text: "Chào bạn! Tôi là trợ lý AI của Chợ Xe Đạp. Tôi có thể giúp gì cho bạn về quy định sàn hoặc hướng dẫn sử dụng không?", sender: "bot", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
                ]);
            }
        }
    }, [type, user, currentUser, conversation?.id]);

    const parseAiResponse = (text: string) => {
        try {
            // Nếu text là một JSON string chứa key "answer", trích xuất nó
            if (text.trim().startsWith('{') && text.trim().endsWith('}')) {
                const parsed = JSON.parse(text);
                if (parsed.answer) return parsed.answer;
                if (parsed.message) return parsed.message;
            }
        } catch (e) {
            // Không phải JSON hoặc lỗi parse, trả về text gốc
        }
        return text;
    };

    const loadAiHistory = async () => {
        try {
            const response = await aiApi.getHistory();
            if (response.data && response.data.length > 0) {
                const history = response.data.map((h: any, idx: number) => ({
                    id: idx,
                    text: (h.role || h.Role) === 'ai' ? parseAiResponse(h.message || h.Message) : (h.message || h.Message),
                    sender: (h.role || h.Role) === 'ai' ? 'bot' : 'user',
                    time: new Date(h.created_at || h.createdAt || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }));
                setLocalMessages(history);
            } else {
                setLocalMessages([
                    { id: 1, text: "Chào bạn! Tôi là trợ lý AI của Chợ Xe Đạp. Tôi có thể giúp gì cho bạn về quy định sàn hoặc hướng dẫn sử dụng không?", sender: "bot", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
                ]);
            }
        } catch (error) {
            console.error('Failed to load AI history:', error);
        }
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [localMessages, conversationMessages, isAiLoading]);

    const handleSendMessage = async () => {
        if (!message.trim() || isAiLoading) return;

        const userMsg = message.trim();
        setMessage("");

        if (type === 'support') {
            const newMessage = {
                id: Date.now(),
                text: userMsg,
                sender: "user",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setLocalMessages(prev => [...prev, newMessage]);
            
            setIsAiLoading(true);
            try {
                // Prepare history for API
                const historyStrings = localMessages.map(m => m.text);
                const response = await aiApi.chat(userMsg, historyStrings);
                
                setLocalMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    text: parseAiResponse(response.answer),
                    sender: "bot",
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
            } catch (error: any) {
                console.error('AI Chat error:', error);
                const errorMessage = error.message || "Xin lỗi, tôi gặp sự cố khi kết nối. Vui lòng thử lại sau.";
                setLocalMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    text: errorMessage,
                    sender: "bot",
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
            } finally {
                setIsAiLoading(false);
            }
        } else if (user) {
            // Real Peer Chat via SignalR
            await sendMessage(parseInt(user.id), userMsg);
            // SignalR ReceiveMessage handler in Context will update messages state
        }
    };

    const displayMessages = type === 'support' 
        ? localMessages 
        : (conversationMessages || []).map(m => ({
            id: m.id,
            text: m.content,
            sender: m.senderId.toString() === currentUser?.id?.toString() ? 'user' : 'target',
            time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));

    return (
        <div
            className="w-[330px] h-[450px] bg-white rounded-t-xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-300"
            style={{ zIndex }}
        >
            {/* Header */}
            <div className="p-3 flex items-center justify-between text-white shadow-sm bg-[#2E9147]">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                        {type === 'peer' ? (
                            user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <User size={18} />
                            )
                        ) : (
                            <Bot size={18} />
                        )}
                    </div>
                    <div className="flex flex-col justify-center max-w-[200px]">
                        <h3 className="font-semibold text-sm leading-tight truncate">
                            {type === 'peer' ? user?.name : 'Trợ lý AI'}
                        </h3>
                        <span className="text-[10px] text-white/80">
                            {type === 'peer' ? 'Đang hoạt động' : 'Đang trực tuyến'}
                        </span>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 p-3 bg-gray-50 overflow-y-auto space-y-3 scroll-smooth">
                {displayMessages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'items-start'}`}>
                        <div className={`p-2 rounded-2xl shadow-sm text-sm border ${msg.sender === 'user'
                            ? 'bg-[#2E9147] text-white border-[#2E9147] rounded-br-sm'
                            : 'bg-white text-gray-800 border-gray-100 rounded-bl-sm'
                            }`}>
                            <p>{msg.text}</p>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 mx-1">{msg.time}</span>
                    </div>
                ))}
                {isAiLoading && (
                    <div className="flex items-start gap-2">
                        <div className="bg-white p-2 rounded-2xl rounded-tl-none border border-gray-100 flex items-center gap-1">
                            <Loader2 size={14} className="animate-spin text-[#2E9147]" />
                            <span className="text-xs text-gray-400">AI đang nghĩ...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <form 
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                }}
                className="p-3 bg-white border-t border-gray-100"
            >
                <div className={`flex items-center gap-2 bg-gray-100 p-1.5 rounded-full focus-within:ring-2 ring-[#2E9147]/20 transition-all ${isAiLoading ? 'opacity-50' : ''}`}>
                    <input
                        type="text"
                        placeholder={isAiLoading ? "Đang trả lời..." : "Nhập tin nhắn..."}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="flex-1 bg-transparent border-none focus:outline-none text-sm px-3 text-gray-700"
                        disabled={isAiLoading}
                    />
                    <button
                        type="submit"
                        disabled={!message.trim() || isAiLoading}
                        className={`p-1.5 rounded-full transition-all ${message.trim() && !isAiLoading ? 'text-[#2E9147]' : 'text-gray-400'}`}
                    >
                        {isAiLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                </div>
            </form>
        </div>
    );
}
