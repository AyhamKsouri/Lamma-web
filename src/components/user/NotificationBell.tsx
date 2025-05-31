import React, { useState } from 'react';
import { Bell, Calendar, User, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const mockNotifications = [
  { id: 1, type: 'event', label: '🎉 Design Sprint Kickoff', targetId: '123' },
  { id: 2, type: 'profile', label: '👤 Ayham followed you', targetId: 'user456' },
  { id: 3, type: 'system', label: '⚠️ Maintenance at 11PM', targetId: null },
];

const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleClick = (notif: typeof mockNotifications[0]) => {
    setOpen(false);
    if (notif.type === 'event') navigate(`/events/${notif.targetId}`);
    else if (notif.type === 'profile') navigate(`/admin/users/${notif.targetId}`);
  };

  const getIcon = (type: string) => {
    if (type === 'event') return <Calendar className="w-4 h-4 text-purple-500" />;
    if (type === 'profile') return <User className="w-4 h-4 text-blue-500" />;
    return <Info className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative"
      >
        <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        {mockNotifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {mockNotifications.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-80 max-h-96 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/90 backdrop-blur-md shadow-2xl z-50"
          >
            <div className="px-4 py-3 border-b dark:border-gray-700 flex justify-between items-center">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Notifications</h4>
              <button
                onClick={() => setOpen(false)}
                className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Close
              </button>
            </div>

            {mockNotifications.length > 0 ? (
              mockNotifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className="w-full text-left px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition flex items-start gap-3 border-b last:border-0 border-gray-100 dark:border-gray-700"
                >
                  <div className="mt-1">{getIcon(n.type)}</div>
                  <div className="text-sm text-gray-700 dark:text-gray-200">{n.label}</div>
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                You're all caught up 🎉
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
