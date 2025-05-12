'use client';

import { useState } from 'react';
import { X, Bell, Calendar, User, Info } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'warning' | 'success';
  read: boolean;
}

interface NotificationsPanelProps {
  onClose: () => void;
}

export default function NotificationsPanel({ onClose }: NotificationsPanelProps) {
  // Mock notifications data
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New Visitor',
      message: 'John Doe has checked in for a meeting with you.',
      time: '10 minutes ago',
      type: 'info',
      read: false
    },
    {
      id: '2',
      title: 'Training Completed',
      message: 'Sarah Johnson has completed the safety training.',
      time: '1 hour ago',
      type: 'success',
      read: false
    },
    {
      id: '3',
      title: 'Visitor Check-out',
      message: 'Michael Smith has checked out.',
      time: '3 hours ago',
      type: 'info',
      read: true
    },
    {
      id: '4',
      title: 'System Update',
      message: 'The system will be updated tonight at 10 PM.',
      time: '1 day ago',
      type: 'warning',
      read: true
    }
  ]);
  
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      read: true
    })));
  };
  
  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };
  
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg z-50 overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center">
          <Bell className="h-5 w-5 text-blue-900 mr-2" />
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center">
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="text-xs text-blue-700 hover:text-blue-900 mr-3"
            >
              Mark all as read
            </button>
          )}
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No notifications
          </div>
        ) : (
          <div>
            {notifications.map(notification => (
              <div 
                key={notification.id}
                className={`p-4 border-b hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex">
                  <div className="flex-shrink-0 mr-3">
                    {notification.type === 'info' && (
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Info className="h-4 w-4 text-blue-600" />
                      </div>
                    )}
                    {notification.type === 'warning' && (
                      <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-yellow-600" />
                      </div>
                    )}
                    {notification.type === 'success' && (
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-green-600" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-3 border-t text-center">
        <button className="text-sm text-blue-700 hover:text-blue-900">
          View all notifications
        </button>
      </div>
    </div>
  );
}
