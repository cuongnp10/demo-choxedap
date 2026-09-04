import type { UserChatData } from '../../contexts/ChatContext';
import { User } from 'lucide-react';

interface ChatItemProps {
    id: string;
    name: string;
    avatar?: string;
    lastMessage: string;
    timestamp: string;
    isUnread?: boolean;
    onClick: (user: UserChatData) => void;
}

export function ChatItem({ id, name, avatar, lastMessage, timestamp, isUnread, onClick }: ChatItemProps) {
    return (
        <div
            className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-none"
            onClick={() => onClick({ id, name, avatar })}
        >
            <div className="relative shrink-0">
                {avatar ? (
                    <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover border border-gray-100" />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        <User size={24} />
                    </div>
                )}
                {isUnread && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full"></span>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                    <h4 className={`text-sm truncate mr-2 ${isUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
                        {name}
                    </h4>
                    <span className="text-[11px] text-gray-500 whitespace-nowrap">{timestamp}</span>
                </div>
                <p className={`text-xs truncate ${isUnread ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                    {lastMessage}
                </p>
            </div>
        </div>
    );
}
