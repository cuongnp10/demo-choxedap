import React from 'react';
import { useNotifications, type NotificationType } from '../contexts/NotificationContext';
import { formatRelativeTime } from '../lib/utils';
import { Bell, Package, CheckCircle, XCircle, ChevronRight, Inbox } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotificationPage: React.FC = () => {
  const { notifications, markAsRead, fetchNotifications } = useNotifications();
  const navigate = useNavigate();

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'ORDER': return <Package size={24} className="text-blue-500" />;
      case 'POST':
      case 'SUCCESS': return <CheckCircle size={24} className="text-green-500" />;
      case 'ALERT': return <XCircle size={24} className="text-red-500" />;
      default: return <Bell size={24} className="text-gray-500" />;
    }
  };

  const handleItemClick = (notification: any) => {
    markAsRead(notification.id);
    if (notification.type === 'ORDER' && notification.referenceId) {
      navigate(`/account/buyer/order/${notification.referenceId}`);
    } else if (notification.type === 'ORDER') {
      navigate('/account/buyer/history');
    } else if (notification.type === 'POST') {
      navigate('/account/seller/overview');
    } else if (notification.type === 'MESSAGE') {
      navigate('/account/chat');
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full py-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thông báo của bạn</h1>
          <p className="text-gray-500 mt-1">Cập nhật những tin tức mới nhất về đơn hàng và tài khoản</p>
        </div>
        <button 
          onClick={() => fetchNotifications()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
          title="Làm mới"
        >
          <Bell size={20} />
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {notifications.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleItemClick(n)}
                className={`p-6 cursor-pointer flex gap-4 transition-all hover:bg-gray-50 ${
                  !n.isRead ? 'bg-blue-50/30' : 'bg-white'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                  !n.isRead ? 'bg-white shadow-sm' : 'bg-gray-50'
                }`}>
                  {getIcon(n.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-lg leading-tight ${!n.isRead ? 'font-bold text-gray-900' : 'font-semibold text-gray-600'}`}>
                      {n.title}
                    </h4>
                    <span className="text-sm text-gray-400 whitespace-nowrap ml-4 font-medium">
                      {formatRelativeTime(n.createdAt)}
                    </span>
                  </div>
                  <p className={`text-base leading-relaxed ${!n.isRead ? 'text-gray-700' : 'text-gray-500'}`}>
                    {n.message}
                  </p>
                </div>

                <div className="flex items-center">
                  <ChevronRight size={20} className="text-gray-300" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Inbox size={40} className="text-gray-200" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Hộp thư trống</h3>
            <p className="text-gray-500 mt-2">Bạn chưa có thông báo nào vào lúc này.</p>
          </div>
        )}
      </div>
    </div>
  );
};
