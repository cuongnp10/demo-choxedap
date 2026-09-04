import React, { useState } from 'react';
import { Bell, Package, CheckCircle, XCircle, MoreHorizontal, Check } from 'lucide-react';
import { formatRelativeTime } from '../../lib/utils';
import { useNotifications, type NotificationType } from '../../contexts/NotificationContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface NotificationDropdownProps {
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const [visibleReadCount, setVisibleReadCount] = React.useState(5);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'ORDER': return <Package size={18} className="text-blue-500" />;
      case 'POST':
      case 'SUCCESS': return <CheckCircle size={18} className="text-green-500" />;
      case 'ALERT': return <XCircle size={18} className="text-red-500" />;
      default: return <Bell size={18} className="text-gray-500" />;
    }
  };

  const handleLoadMore = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setVisibleReadCount(prev => prev + 5);
  };

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const allReadNotifications = notifications.filter(n => n.isRead);
  
  const filteredNotifications = activeTab === 'all' 
    ? [...unreadNotifications, ...allReadNotifications.slice(0, visibleReadCount)]
    : unreadNotifications;

  const hasMore = activeTab === 'all' && visibleReadCount < allReadNotifications.length;

  const handleNotificationClick = async (id: string) => {
    await markAsRead(id);
    onClose();
    // Có thể thêm điều hướng ở đây nếu cần dựa trên loại thông báo
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    onClose();
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-[400px] bg-white rounded-xl shadow-[0_12px_28px_0_rgba(0,0,0,0.2),0_2px_4px_0_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
      <div className="p-4 bg-white sticky top-0 z-10 border-b border-gray-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-2xl text-gray-900 tracking-tight">Thông báo</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <MoreHorizontal size={20} className="text-gray-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem 
                onClick={handleMarkAllAsRead}
                className="cursor-pointer py-2"
              >
                <Check className="mr-2 h-4 w-4" />
                <span>Đánh dấu tất cả đã đọc</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              activeTab === 'all' 
                ? 'bg-[#E7F3EF] text-[#2E9147]' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all relative ${
              activeTab === 'unread' 
                ? 'bg-[#E7F3EF] text-[#2E9147]' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Chưa đọc
            {unreadNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            )}
          </button>
        </div>
      </div>

      <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
        {filteredNotifications.length > 0 ? (
          <div className="flex flex-col">
            {filteredNotifications.map((n) => (
              <div
                key={n.id}
                className="px-2 py-1"
                onClick={() => handleNotificationClick(n.id)}
              >
                <div className={`p-2 flex gap-3 rounded-lg relative group cursor-pointer transition-colors ${!n.isRead ? 'bg-blue-50/40 hover:bg-blue-50/60' : 'hover:bg-gray-50'}`}>
                  <div className={`mt-1 w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${!n.isRead ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                    {getIcon(n.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-4">
                    <p className={`text-[15px] leading-tight mb-1 line-clamp-3 ${!n.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>
                      <span className="font-bold">{n.title}</span>: {n.message}
                    </p>
                    <span className={`text-xs font-bold ${!n.isRead ? 'text-[#2E9147]' : 'text-gray-500'}`}>
                      {formatRelativeTime(n.createdAt)}
                    </span>
                  </div>
                  
                  {!n.isRead && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-2.5 h-2.5 bg-[#2E9147] rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell size={32} className="text-gray-200" />
            </div>
            <p className="text-sm text-gray-500 font-medium">
              {activeTab === 'unread' ? 'Không có thông báo chưa đọc' : 'Bạn chưa có thông báo nào'}
            </p>
          </div>
        )}
      </div>

      {hasMore && (
        <div className="p-2 bg-white border-t border-gray-100">
          <button 
            className="w-full py-3 text-sm text-[#2E9147] font-bold hover:bg-gray-100 rounded-lg transition-colors"
            onClick={handleLoadMore}
          >
            Xem thêm thông báo
          </button>
        </div>
      )}
    </div>
  );
};
