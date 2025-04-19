import { motion } from 'framer-motion';
import { CheckIcon, XIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';

type NotificationsDropdownProps = {
  onClose: () => void;
};

const NotificationsDropdown = ({ onClose }: NotificationsDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  const notifications = [
    {
      id: 1,
      title: 'Profile scan completed',
      message: 'The profile scan for John Doe has been completed.',
      time: '5 min ago',
      read: false,
    },
    {
      id: 2,
      title: 'New match found',
      message: 'A new social media profile match has been found.',
      time: '2 hours ago',
      read: false,
    },
    {
      id: 3,
      title: 'System update',
      message: 'The system has been updated to version 1.2.0.',
      time: '1 day ago',
      read: true,
    },
  ];
  
  return (
    <motion.div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 rounded-md border border-background-lighter bg-background-light shadow-lg"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="border-b border-background-lighter p-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Notifications</h3>
          <button className="text-xs text-primary-400 hover:text-primary-300">
            Mark all as read
          </button>
        </div>
      </div>
      
      <div className="max-h-72 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-400">
            No notifications
          </div>
        ) : (
          <div>
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`border-b border-background-lighter p-3 hover:bg-background-lighter ${
                  !notification.read ? 'bg-background-lighter/50' : ''
                }`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <h4 className={`text-sm font-medium ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
                    {notification.title}
                  </h4>
                  <span className="text-xs text-gray-500">{notification.time}</span>
                </div>
                <p className="text-xs text-gray-400">{notification.message}</p>
                <div className="mt-2 flex justify-end gap-2">
                  <button className="rounded-full p-1 text-gray-400 hover:bg-background hover:text-gray-300">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </button>
                  <button className="rounded-full p-1 text-gray-400 hover:bg-background hover:text-gray-300">
                    <XIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-2 text-center">
        <button className="text-xs text-primary-400 hover:text-primary-300">
          View all notifications
        </button>
      </div>
    </motion.div>
  );
};

export default NotificationsDropdown;