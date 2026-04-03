// src/components/NotificationCenter.jsx
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Bell } from 'lucide-react';

export default function NotificationCenter() {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Backend websocket se connect karein
        const socket = io('http://localhost:5000');

        // 'campaign_alert' event ko listen karein
        socket.on('campaign_alert', (data) => {
            setNotifications(prev => [data, ...prev]);
        });

        return () => socket.disconnect();
    }, []);

    const unreadCount = notifications.length;

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
                <Bell size={24} className="text-slate-800 dark:text-white" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown  */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                    <div className="p-4 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold text-slate-800 dark:text-white">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <p className="p-4 text-sm text-slate-500 text-center">No new alerts</p>
                        ) : (
                            notifications.map((notif, index) => (
                                <div key={index} className="p-4 border-b border-slate-100 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
                                    <p>{notif.message}</p>
                                    <span className="text-xs text-slate-500 mt-1 block">
                                        {new Date(notif.time).toLocaleTimeString()}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}