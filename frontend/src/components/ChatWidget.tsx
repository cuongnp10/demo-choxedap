import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, User } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';

export const ChatWidget: React.FC = () => {
    const { isOpen, chatType, targetUser, toggleChat, closeChat } = useChat();
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([
        { id: 1, text: "Chào bạn! Chợ Xe Đạp có thể giúp gì cho bạn?", sender: "bot", time: "20:50" },
    ]);

    const scrollRef = useRef<HTMLDivElement>(null);

    // Update initial message based on chat type
    useEffect(() => {
        if (chatType === 'peer' && targetUser) {
            setMessages([
                { id: 1, text: `Chào bạn, mình quan tâm đến xe của bạn.`, sender: "user", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
                { id: 2, text: `Chào bạn! Mình là ${targetUser.name}, xe vẫn còn ạ. Bạn muốn qua xem xe lúc nào?`, sender: "target", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
            ]);
        } else if (chatType === 'support') {
            setMessages([
                { id: 1, text: "Chào bạn! Chợ Xe Đạp có thể giúp gì cho bạn?", sender: "bot", time: "20:50" },
            ]);
        }
    }, [chatType, targetUser]);

    // Auto-scroll to bottom whenever messages change or chat is opened
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSendMessage = () => {
        if (!message.trim()) return;

        const newMessage = {
            id: Date.now(),
            text: message,
            sender: "user",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, newMessage]);
        setMessage("");

        // Simple mock response
        setTimeout(() => {
            const responseText = chatType === 'support' 
                ? "Cảm ơn bạn đã liên hệ. Đội ngũ hỗ trợ sẽ phản hồi bạn trong giây lát."
                : "Dạ vâng ạ, bạn cứ tự nhiên nhé!";
            
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: responseText,
                sender: chatType === 'support' ? "bot" : "target",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }, 1000);
    };

    return (
        <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[100] flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-80 md:w-[360px] h-[450px] md:h-[500px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Header */}
                    <div className="bg-[#2E9147] p-3 md:p-4 flex items-center justify-between text-white shadow-md">
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                                {chatType === 'peer' ? (
                                    targetUser?.avatar ? (
                                        <img src={targetUser.avatar} alt={targetUser.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={20} />
                                    )
                                ) : (
                                    <MessageSquare size={20} fill="white" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-sm md:text-base leading-tight">
                                    {chatType === 'peer' ? targetUser?.name : 'Hỗ trợ khách hàng'}
                                </h3>
                                <span className="text-[10px] md:text-xs text-white/80 lowercase">
                                    {chatType === 'peer' ? 'Người bán' : 'Đang trực tuyến'}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={closeChat}
                            className="p-1 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Body */}
                    <div
                        ref={scrollRef}
                        className="flex-1 p-3 md:p-4 bg-gray-50 overflow-y-auto space-y-3 md:space-y-4 scroll-smooth"
                    >
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'items-start'}`}
                            >
                                <div className={`p-2.5 md:p-3 rounded-2xl shadow-sm border ${msg.sender === 'user'
                                    ? 'bg-[#2E9147] text-white border-[#2E9147] rounded-tr-none'
                                    : 'bg-white text-gray-800 border-gray-100 rounded-tl-none'
                                    }`}>
                                    <p className="text-xs md:text-sm">{msg.text}</p>
                                </div>
                                <span className="text-[10px] text-gray-400 mt-1 mx-1">{msg.time}</span>
                            </div>
                        ))}
                    </div>

                    {/* Footer Input */}
                    <div className="p-3 md:p-4 bg-white border-t border-gray-100">
                        <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-xl focus-within:ring-2 ring-[#2E9147]/20 transition-all">
                            <input
                                type="text"
                                placeholder="Nhập tin nhắn..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="flex-1 bg-transparent border-none focus:outline-none text-xs md:text-sm px-2 text-gray-700 font-normal"
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                            <button
                                disabled={!message.trim()}
                                onClick={handleSendMessage}
                                className={`p-1.5 md:p-2 rounded-lg transition-all ${message.trim() ? 'bg-[#2E9147] text-white shadow-md' : 'text-gray-400'}`}
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Toggle Button (Only if not already open) */}
            {!isOpen && (
                <button
                    onClick={() => toggleChat()}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 z-50 bg-[#2E9147]"
                    aria-label="Toggle chat"
                >
                    <MessageSquare size={28} color="white" fill="white" />
                </button>
            )}
        </div>
    );
};
