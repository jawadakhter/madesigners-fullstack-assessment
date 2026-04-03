import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { io } from 'socket.io-client';

export default function NotificationCenter() {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // 1. Purani notifications database se mangwayen
        fetch('http://localhost:5000/notifications')
            .then(res => res.json())
            .then(data => setNotifications(data))
            .catch(err => console.error("Error fetching notifications", err));

        // 2. WebSocket Connect karein Real-Time alerts ke liye
        const socket = io('http://localhost:5000');

        socket.on('campaign_alert', (newAlert) => {
            setNotifications(prev => [newAlert, ...prev]);
        });

        return () => socket.disconnect();
    }, []);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-all"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                        <h3 className="font-bold text-slate-800 dark:text-white">Notifications</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <p className="p-4 text-sm text-slate-500 text-center">No new alerts</p>
                        ) : (
                            notifications.map((notif, idx) => (
                                <div key={idx} className="p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <p className="text-sm text-slate-700 dark:text-slate-300">{notif.message}</p>
                                    <p className="text-xs text-slate-400 mt-1">{new Date(notif.created_at).toLocaleTimeString()}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}