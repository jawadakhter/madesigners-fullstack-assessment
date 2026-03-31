// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import useDarkMode from '../hooks/useDarkMode';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LayoutDashboard, PenTool, Sun, Moon, Menu, TrendingUp, MousePointerClick, Eye, DollarSign } from 'lucide-react';
import mockData from '../data.json';
import CampaignTable from './CampaignTable'; // Ye line oopar imports mein daalein
import { Calendar } from 'lucide-react'; // Calendar icon bhi import kar lein
export default function Dashboard({ setActiveTab }) {
    const [theme, toggleTheme] = useDarkMode();
    const [data, setData] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        setData(mockData);
    }, []);

    if (!data) return <div className="flex items-center justify-center h-screen dark:text-white">Loading Dashboard...</div>;

    // KPI Icons mapping
    const icons = {
        impressions: <Eye className="text-blue-500" size={28} />,
        clicks: <MousePointerClick className="text-green-500" size={28} />,
        ctr: <TrendingUp className="text-purple-500" size={28} />,
        spend: <DollarSign className="text-orange-500" size={28} />
    };

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300 font-sans selection:bg-blue-500 selection:text-white">

            {/* Sidebar - Glassmorphism effect */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
                <div className="p-8 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                        <TrendingUp className="text-white" size={18} />
                    </div>
                    <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">AdAgency.</span>
                </div>

                <nav className="mt-4 px-4 space-y-2">
                    <button onClick={() => setActiveTab('dashboard')} className="w-full flex items-center p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium transition-all">
                        <LayoutDashboard className="mr-3" size={20} /> Dashboard Overview
                    </button>
                    <button onClick={() => setActiveTab('builder')} className="w-full flex items-center p-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white font-medium transition-all">
                        <PenTool className="mr-3" size={20} /> AI Brief Builder
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 lg:ml-72 flex flex-col h-screen overflow-y-auto">
                {/* Topbar */}
                <header className="sticky top-0 z-40 flex items-center justify-between p-4 lg:px-10 bg-white/60 dark:bg-[#0f172a]/60 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                    <button className="lg:hidden p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm text-slate-700 dark:text-slate-300" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        <Menu size={24} />
                    </button>
                    <div className="flex-1"></div>
                    <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-yellow-400 transition-all">
                        {theme === "light" ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </header>

                {/* Dashboard Content */}
                <main className="p-6 lg:p-10 max-w-7xl mx-auto w-full">
                    {/* Header Row with Date Range Picker */}
                    <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Campaign Performance</h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">Live metrics across all active campaigns.</p>
                        </div>

                        {/* Simple Date Range Picker UI */}
                        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1.5 rounded-xl shadow-sm">
                            <Calendar className="text-slate-400 ml-2" size={18} />
                            <select className="bg-transparent text-sm font-semibold text-slate-700 dark:text-slate-300 outline-none p-2 border-none cursor-pointer">
                                <option value="7d">Last 7 Days</option>
                                <option value="30d" selected>Last 30 Days</option>
                                <option value="90d">Last 90 Days</option>
                                <option value="custom">Custom Range</option>
                            </select>
                        </div>
                    </div>

                    {/* Premium Area Chart */}
                    <div className="bg-white dark:bg-slate-800/50 p-6 lg:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">30-Day Engagement Trends</h2>
                        </div>
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorImp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} dx={-10} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                        itemStyle={{ fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="impressions" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorImp)" />
                                    <Area type="monotone" dataKey="clicks" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* New Campaign Table */}
                    <CampaignTable campaigns={data.campaigns} />

                </main>
            </div>
        </div>
    );
}