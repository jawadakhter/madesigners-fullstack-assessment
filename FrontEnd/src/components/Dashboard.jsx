// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import useDarkMode from '../hooks/useDarkMode';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LayoutDashboard, PenTool, Sun, Moon, Menu, TrendingUp, MousePointerClick, Eye, DollarSign, Calendar, ShoppingCart, PieChart } from 'lucide-react';
import mockData from '../data.json';
import CampaignTable from './CampaignTable';
import NotificationCenter from './NotificationCenter';

export default function Dashboard({ setActiveTab, onLogout }) {
    const [theme, toggleTheme] = useDarkMode();
    const [dateRange, setDateRange] = useState("30d");
    const [customDates, setCustomDates] = useState({ start: '', end: '' }); // Custom Date State
    const [data, setData] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Backend API se campaigns fetch kar rahe hain
                // Note: Agar JWT token required hai, toh headers mein 'Authorization': `Bearer ${token}` bhejna hoga
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/campaigns', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const dbCampaigns = await response.json();

                    // Chart ka data JSON se aur Campaigns DB se combine kar rahe hain
                    setData({
                        chartData: mockData.chartData,
                        campaigns: dbCampaigns
                    });
                } else {
                    console.log("Failed to fetch from DB, using mock data");
                    setData(mockData); // Agar server error de toh mock data chal jaye
                }
            } catch (error) {
                console.error("API connection error:", error);
                setData(mockData); // Fallback
            }
        };

        fetchDashboardData();
    }, []);

    if (!data) return <div className="flex items-center justify-center h-screen dark:text-white">Loading Dashboard...</div>;

    // --- FILTERING LOGIC ---

    // 1. Chart Data Filter
    const getFilteredChartData = () => {
        if (!data || !data.chartData) return [];
        const allData = data.chartData;

        if (dateRange === "7d") return allData.slice(-7); // Last 7 days
        if (dateRange === "30d") return allData; // All mock data (let's assume it represents 30 days)
        if (dateRange === "90d") {
            // Mocking extra data for 90 days to show a longer chart
            return [...allData, { name: "Week 2", clicks: 5000, impressions: 8000 }, { name: "Week 3", clicks: 6000, impressions: 9500 }, { name: "Week 4", clicks: 7500, impressions: 12000 }];
        }
        if (dateRange === "custom") {
            // Agar custom hai, to sirf pehle 4 din dikha dete hain mockup ke liye (ya aap chahein to asli date comparison laga sakte hain agar JSON mein dates hon)
            return allData.slice(0, 4);
        }
        return allData;
    };

    // 2. Campaign Table Filter
    const getFilteredCampaigns = () => {
        if (!data || !data.campaigns) return [];
        if (dateRange === "7d") return data.campaigns.filter(c => c.status === "Active");
        if (dateRange === "90d") return [...data.campaigns, { id: "0005", name: "Old Promo", client: "BrandX", status: "Completed", budget: 10000, spend: 10000 }];
        return data.campaigns;
    };

    // 3. Dynamic KPI Cards based on filtered Chart Data
    const getFilteredKPIs = () => {
        const filteredChart = getFilteredChartData();
        const totalClicks = filteredChart.reduce((sum, item) => sum + item.clicks, 0);
        const totalImpressions = filteredChart.reduce((sum, item) => sum + item.impressions, 0);

        let spendStr = "$32,450"; let ctrStr = "2.0%"; let convStr = "1,200"; let roasStr = "3.5x";
        if (dateRange === "7d") { spendStr = "$8,100"; ctrStr = "2.5%"; convStr = "350"; roasStr = "4.2x"; }
        if (dateRange === "90d") { spendStr = "$95,000"; ctrStr = "1.8%"; convStr = "3,400"; roasStr = "2.8x"; }
        if (dateRange === "custom") { spendStr = "$15,000"; ctrStr = "2.2%"; convStr = "600"; roasStr = "3.1x"; }

        const formatNumber = (num) => {
            if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
            if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
            return num;
        };

        return {
            impressions: formatNumber(totalImpressions),
            clicks: formatNumber(totalClicks),
            ctr: ctrStr,
            conversions: convStr,
            spend: spendStr,
            roas: roasStr
        };
    };

    const currentKPIs = getFilteredKPIs();

    const icons = {
        impressions: <Eye className="text-blue-500" size={28} />,
        clicks: <MousePointerClick className="text-green-500" size={28} />,
        ctr: <TrendingUp className="text-purple-500" size={28} />,
        conversions: <ShoppingCart className="text-pink-500" size={28} />,
        spend: <DollarSign className="text-orange-500" size={28} />,
        roas: <PieChart className="text-indigo-500" size={28} />
    };

    return (
      <div className="flex h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300 font-sans selection:bg-blue-500 selection:text-white">


 {/* Mobile Overlay */}
        {sidebarOpen && (
            <div 
                className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
                onClick={() => setSidebarOpen(false)} 
            />
        )}


           {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col`}>
                {/* Logo — Fixed */}
            <div className="p-8 flex items-center gap-3 shrink-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                    <TrendingUp className="text-white" size={18} />
                </div>
                <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">AdAgency.</span>
            </div>

               {/* Nav — Scrollable */}
            <nav className="flex-1 overflow-y-auto px-4 space-y-1 pb-8">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 mb-3 mt-2">Main Menu</p>

                    <button onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
                        className="w-full flex items-center p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium transition-all">
                        <LayoutDashboard className="mr-3" size={20} /> Dashboard Overview
                    </button>

                    <button onClick={() => { setActiveTab('builder'); setSidebarOpen(false); }}
                        className="w-full flex items-center p-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white font-medium transition-all">
                        <PenTool className="mr-3" size={20} /> AI Brief Builder
                    </button>

                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 mb-3 mt-6">Clients</p>
                    {['Lumiere Skincare', 'Nike Shoes', 'FutureTech', 'NorthFace'].map(client => (
                        <button key={client} className="w-full flex items-center p-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 font-medium text-sm transition-all">
                            <div className="w-2 h-2 rounded-full bg-blue-400 mr-3"></div> {client}
                        </button>
                    ))}

                    {/* Yeh code sidebar mein "Clients" section ke BAAD add karo */}
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 mb-3 mt-6">Campaigns</p>
                    {data?.campaigns?.map(campaign => (
                        <button key={campaign.id} className="w-full flex items-center p-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 font-medium text-sm transition-all">
                            <div className={`w-2 h-2 rounded-full mr-3 ${campaign.status === 'Active' ? 'bg-green-400' : campaign.status === 'Paused' ? 'bg-yellow-400' : 'bg-gray-400'}`}></div>
                            {campaign.name}
                        </button>
                    ))}

                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 mb-3 mt-6">Settings</p>
                    <button className="w-full flex items-center p-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 font-medium transition-all">
                        <span className="mr-3 text-lg" style={{ fontSize: '16px' }}>⚙</span> Preferences
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

                    {/* YAHAN NOTIFICATION CENTER AUR THEME BUTTON KO EK SATH RAKHEIN */}
                    <div className="flex items-center gap-4">
                        <NotificationCenter />
                        <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-yellow-400 transition-all">
                            {theme === "light" ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        {/* NAYA — Logout Button */}
                        <button onClick={onLogout} className="px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-bold border border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all">
                            Logout
                        </button>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="p-6 lg:p-10 max-w-7xl mx-auto w-full">

                    {/* Header & Filter Section */}
                    <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Campaign Performance</h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">Live metrics across all active campaigns.</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">

                            {/* NAYA: Custom Date Inputs (Sirf tab dikhenge jab "custom" select ho) */}
                            {dateRange === 'custom' && (
                                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <input type="date" value={customDates.start} onChange={(e) => setCustomDates({ ...customDates, start: e.target.value })} className="p-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
                                    <span className="text-slate-400">-</span>
                                    <input type="date" value={customDates.end} onChange={(e) => setCustomDates({ ...customDates, end: e.target.value })} className="p-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            )}

                            {/* Dropdown */}
                            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1.5 rounded-xl shadow-sm">
                                <Calendar className="text-slate-400 ml-2" size={18} />
                                <select
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value)}
                                    className="bg-transparent text-sm font-semibold text-slate-700 dark:text-slate-300 outline-none p-2 border-none cursor-pointer"
                                >
                                    <option value="7d">Last 7 Days</option>
                                    <option value="30d">Last 30 Days</option>
                                    <option value="90d">Last 90 Days</option>
                                    <option value="custom">Custom Range</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* KPI Cards - Ab currentKPIs object use kar rahe hain */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        {Object.entries(currentKPIs).map(([key, value]) => (
                            <div key={key} className="group p-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{key}</p>
                                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg group-hover:scale-110 transition-transform">
                                        {icons[key.toLowerCase()]}
                                    </div>
                                </div>
                                <p className="text-4xl font-extrabold text-slate-900 dark:text-white">{value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Line Chart - Baki same hai */}
                    <div className="bg-white dark:bg-slate-800/50 p-6 lg:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Engagement Trends</h2>
                        </div>
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={getFilteredChartData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                                    <Line type="monotone" dataKey="impressions" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorImp)" />
                                    <Line type="monotone" dataKey="clicks" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Campaign Table */}
                    <CampaignTable campaigns={getFilteredCampaigns()} />

                </main>
            </div>
        </div>
    );
}