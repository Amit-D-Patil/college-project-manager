import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Bell, User, LogOut, CheckCircle, AlertTriangle, Info, AlertOctagon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [showNotif, setShowNotif] = useState(false);

  const getNotifIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={16} className="text-emerald-500" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-amber-500" />;
      case 'alert':
        return <AlertOctagon size={16} className="text-rose-500" />;
      default:
        return <Info size={16} className="text-blue-500" />;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 relative shadow-sm z-30">
      {/* Search/Breadcrumb placeholder */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          University ERP Dashboard
        </h2>
      </div>

      <div className="flex items-center gap-6">
        {/* Notifications Tray */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotif(!showNotif);
              if (!showNotif && unreadCount > 0) markAllAsRead();
            }}
            className="p-2 text-slate-500 hover:text-primary-600 rounded-full hover:bg-slate-100 transition-all relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-rose-500 text-white font-bold text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Drawer */}
          {showNotif && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl z-40 py-2">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-800">Notification Tray</h4>
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary-500 font-semibold hover:underline"
                >
                  Mark all read
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-slate-400">
                    No recent notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      className={`px-4 py-3 hover:bg-slate-50 border-b border-slate-100 flex gap-3 text-xs ${
                        !notif.isRead ? 'bg-slate-50/70 font-medium' : ''
                      }`}
                    >
                      <div className="mt-0.5">{getNotifIcon(notif.type)}</div>
                      <div>
                        <h5 className="font-semibold text-slate-700">{notif.title}</h5>
                        <p className="text-slate-500 text-[11px] leading-tight mt-0.5">
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right">
            <h4 className="text-xs font-semibold text-slate-700 capitalize">
              {user?.currentRole}
            </h4>
            <span className="text-[10px] text-slate-400 font-medium">{user?.email}</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold border border-primary-200">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
