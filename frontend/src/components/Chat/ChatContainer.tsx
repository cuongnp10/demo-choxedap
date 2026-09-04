import { MessageSquare } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { ChatWindow } from './ChatWindow';

export function ChatContainer() {
    const { isSupportOpen, toggleSupportChat, closeSupportChat, activeChats, closePeerChat } = useChat();

    return (
        <div className="fixed bottom-0 right-4 md:right-8 z-[100] flex items-end gap-4 pointer-events-none">

            {/* Peer Chats (Users) - Pushed to the left of the support button */}
            <div className="flex items-end gap-3 pointer-events-auto">
                {activeChats.map((chat, index) => (
                    <div key={chat.id} className="hidden sm:block"> {/* Hide peer chats on very small screens, or we can use normal classes */}
                        <ChatWindow
                            type="peer"
                            user={chat}
                            onClose={() => closePeerChat(chat.id)}
                            zIndex={50 + index}
                        />
                    </div>
                ))}
            </div>

            {/* Support Chat Box & Button Group - Positioned on far right */}
            <div className="flex flex-col items-end gap-4 mb-4 md:mb-6 pointer-events-auto relative">
                {isSupportOpen && (
                    <div className="absolute bottom-16 right-0 md:bottom-20 z-[60]">
                        <ChatWindow
                            type="support"
                            onClose={closeSupportChat}
                            zIndex={60}
                        />
                    </div>
                )}

                <button
                    onClick={toggleSupportChat}
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-105 active:scale-95 bg-[#2E9147] border-[3px] border-white focus:outline-none"
                    aria-label="Toggle Support Chat"
                >
                    <MessageSquare size={26} color="white" fill="white" />
                </button>
            </div>

        </div>
    );
}
