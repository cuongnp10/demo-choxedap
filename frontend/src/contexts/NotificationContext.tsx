import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuth } from './AuthContext';
import api from '../lib/api';

export type NotificationType = 'ORDER' | 'POST' | 'SYSTEM' | 'ALERT' | 'SUCCESS' | 'MESSAGE';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  createdAt: string;
  isRead: boolean;
  referenceId?: number;
}

interface NotificationContextType {
  connection: signalR.HubConnection | null;
  joinPaymentGroup: (paymentCode: string) => Promise<void>;
  isConnected: boolean;
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await api.get('/notifications');
      if (response.data.status === "Success") {
        setNotifications(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, [isAuthenticated]);

  const markAsRead = async (id: string) => {
    try {
      const response = await api.post(`/notifications/${id}/read`);
      if (response.data.status === "Success") {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await api.post('/notifications/read-all');
      if (response.data.status === "Success") {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [isAuthenticated, fetchNotifications]);

  useEffect(() => {
    if (isAuthenticated && !connection) {
      const token = localStorage.getItem("choxedap_token");
      const newConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${import.meta.env.VITE_API_URL}/notificationHub`, {
          accessTokenFactory: () => token || ""
        })
        .withAutomaticReconnect()
        .build();

      newConnection.on("ReceiveNotification", (notification: any) => {
        setNotifications(prev => [notification, ...prev]);
      });

      newConnection.start()
        .then(() => {
          console.log("Connected to SignalR NotificationHub");
          setIsConnected(true);
          setConnection(newConnection);
          
          if (user?.id) {
            newConnection.invoke("JoinPrivateGroup", user.id.toString());
          }
        })
        .catch(err => console.error("NotificationHub Connection Error: ", err));

      return () => {
        newConnection.stop();
      };
    }
  }, [isAuthenticated, user?.id]);

  const joinPaymentGroup = useCallback(async (paymentCode: string) => {
    if (connection && isConnected) {
      try {
        await connection.invoke("JoinPaymentGroup", paymentCode);
        console.log(`Joined payment group: ${paymentCode}`);
      } catch (err) {
        console.error("Error joining payment group: ", err);
      }
    }
  }, [connection, isConnected]);

  return (
    <NotificationContext.Provider value={{ 
      connection, 
      joinPaymentGroup, 
      isConnected,
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      fetchNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
