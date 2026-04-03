// src/components/CampaignTable.jsx
import React, { useState } from 'react';
import { ArrowUpDown, Search } from 'lucide-react';

export default function CampaignTable({ campaigns }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  // Filtering Logic
  const filteredCampaigns = campaigns.filter(campaign => 
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sorting Logic
  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Status Badge Helper
  const getStatusBadge = (status) => {
    const baseStyle = "px-3 py-1 rounded-full text-xs font-bold ";
    switch(status.toLowerCase()) {
      case 'active': return baseStyle + "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case 'paused': return baseStyle + "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case 'completed': return baseStyle + "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
      default: return baseStyle + "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    }
  };

  return (
    <div className="mt-10 bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      
      {/* Table Header & Search */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Campaigns</h2>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search campaigns or clients..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
          />
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-700">
              <th className="p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => requestSort('name')}>
                <div className="flex items-center gap-2">Campaign <ArrowUpDown size={14} /></div>
              </th>
              <th className="p-4">Client</th>
              <th className="p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => requestSort('status')}>
                <div className="flex items-center gap-2">Status <ArrowUpDown size={14} /></div>
              </th>
              {/* Naye Columns Headers */}
              <th className="p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-right" onClick={() => requestSort('impressions')}>
                <div className="flex items-center justify-end gap-2">Impressions <ArrowUpDown size={14} /></div>
              </th>
              <th className="p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-right" onClick={() => requestSort('clicks')}>
                <div className="flex items-center justify-end gap-2">Clicks <ArrowUpDown size={14} /></div>
              </th>
              <th className="p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-right" onClick={() => requestSort('conversions')}>
                <div className="flex items-center justify-end gap-2">Conversions <ArrowUpDown size={14} /></div>
              </th>
              <th className="p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-right" onClick={() => requestSort('spend')}>
                <div className="flex items-center justify-end gap-2">Spend / Budget <ArrowUpDown size={14} /></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-700 dark:text-slate-300">
            {sortedCampaigns.map((camp) => (
              <tr key={camp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="p-4 font-semibold text-slate-900 dark:text-white">{camp.name}</td>
                <td className="p-4 text-sm">{camp.client}</td>
                <td className="p-4">
                  <span className={getStatusBadge(camp.status)}>{camp.status}</span>
                </td>
                {/* Naye Columns Data */}
                <td className="p-4 text-right text-sm">{camp.impressions?.toLocaleString()}</td>
                <td className="p-4 text-right text-sm">{camp.clicks?.toLocaleString()}</td>
                <td className="p-4 text-right text-sm">{camp.conversions?.toLocaleString()}</td>
                <td className="p-4 text-right">
                  <div className="font-semibold text-slate-900 dark:text-white">${camp.spend.toLocaleString()}</div>
                  <div className="text-xs text-slate-400">of ${camp.budget.toLocaleString()}</div>
                </td>
              </tr>
            ))}
            {sortedCampaigns.length === 0 && (
              <tr>
                <td colSpan="7" className="p-8 text-center text-slate-500">No campaigns found matching "{searchTerm}"</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}