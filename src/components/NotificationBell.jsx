import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import fcmService from '../services/fcmService';
import Card from './ui/Card';
import Badge from './ui/Badge';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { showToast } = useToast();

  useEffect(() => {
    // Load notifications from localStorage on mount
    const loadNotifications = () => {
      try {
        const saved = localStorage.getItem('notifications');
        if (saved) {
          const parsed = JSON.parse(saved);
          setNotifications(parsed);
          const unread = parsed.filter((n) => !n.isRead).length;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error('Failed to load notifications from localStorage:', error);
      }
    };

    loadNotifications();

    // Set up FCM message callback
    fcmService.setOnMessageCallback((payload) => {
      console.log('Notification received in NotificationBell:', payload);
      handleNewNotification(payload);
    });

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNewNotification = (payload) => {
    const notification = {
      id: payload.messageId || Date.now().toString(),
      title: payload.notification?.title || 'New Notification',
      body: payload.notification?.body || '',
      data: payload.data || {},
      timestamp: new Date(),
      isRead: false,
    };

    setNotifications((prev) => {
      const updated = [notification, ...prev];
      // Keep only last 100 notifications
      const limited = updated.slice(0, 100);
      // Save to localStorage
      try {
        localStorage.setItem('notifications', JSON.stringify(limited));
      } catch (error) {
        console.error('Failed to save notifications to localStorage:', error);
      }
      return limited;
    });
    setUnreadCount((prev) => prev + 1);

    // Show toast notification
    showToast(notification.title, 'info');
  };

  const markAsRead = (notificationId) => {
    setNotifications((prev) => {
      const updated = prev.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      // Save to localStorage
      try {
        localStorage.setItem('notifications', JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save notifications to localStorage:', error);
      }
      return updated;
    });
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, isRead: true }));
      // Save to localStorage
      try {
        localStorage.setItem('notifications', JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save notifications to localStorage:', error);
      }
      return updated;
    });
    setUnreadCount(0);
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-error-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-800 rounded-lg shadow-depth-lg border border-neutral-200 dark:border-neutral-700 z-50">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
            <h3 className="font-semibold text-neutral-900 dark:text-white">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 cursor-pointer transition-colors ${
                      !notification.isRead ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold mb-1 ${
                          !notification.isRead
                            ? 'text-neutral-900 dark:text-white'
                            : 'text-neutral-600 dark:text-neutral-400'
                        }`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-500 mb-2">
                          {notification.body}
                        </p>
                        <p className="text-xs text-neutral-400 dark:text-neutral-500">
                          {formatTimeAgo(notification.timestamp)}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-primary-500 rounded-full mt-1 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
