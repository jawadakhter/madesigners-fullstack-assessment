// ============================================
// Q4 — React Performance Optimization
// Fix unnecessary re-renders
// ============================================

import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';

// ============================================
// ❌ SLOW VERSION (Problems identified):
// ============================================
/*
function SlowDashboard({ campaigns }) {

  // PROBLEM 1: Har render pe naya object banta hai
  const filters = { status: 'Active', sort: 'name' };

  // PROBLEM 2: Har render pe naya function banta hai
  const handleClick = (id) => {
    console.log('clicked', id);
  };

  // PROBLEM 3: Heavy calculation har render pe
  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);

  return (
    <div>
      {campaigns.map(c => (
        // PROBLEM 4: Inline function — child har baar re-render hoga
        <CampaignCard
          key={c.id}
          campaign={c}
          onClick={() => handleClick(c.id)}  // Naya function har baar!
        />
      ))}
    </div>
  );
}

// PROBLEM 5: memo nahi hai — parent update pe ye bhi update hoga
function CampaignCard({ campaign, onClick }) {
  return <div onClick={onClick}>{campaign.name}</div>;
}
*/

// ============================================
// ✅ OPTIMIZED VERSION:
// ============================================

// FIX 5: memo — sirf tab re-render ho jab props change hon
const CampaignCard = memo(({ campaign, onClick }) => {
  console.log(`Rendering: ${campaign.name}`); // DevTools mein check karo

  return (
    <div
      onClick={() => onClick(campaign.id)}
      className="p-4 bg-white rounded-lg border cursor-pointer hover:shadow-md"
    >
      <h3 className="font-bold">{campaign.name}</h3>
      <p className="text-sm text-gray-500">{campaign.client}</p>
      <p className="text-green-600">${campaign.budget?.toLocaleString()}</p>
    </div>
  );
});

// Display name for React DevTools
CampaignCard.displayName = 'CampaignCard';

// ✅ OPTIMIZED PARENT COMPONENT
function OptimizedDashboard({ campaigns }) {
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState('All');

  // FIX 1: useCallback — function reference stable rehti hai
  const handleCardClick = useCallback((id) => {
    setSelectedId(id);
    console.log('Campaign selected:', id);
  }, []); // Empty deps = kabhi nahi badlega

  // FIX 2: useMemo — heavy calculation sirf tab hogi jab campaigns change hon
  const totalBudget = useMemo(() => {
    console.log('Calculating total budget...'); // Sirf zaroorat pe chalega
    return campaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
  }, [campaigns]); // Sirf jab campaigns array change ho

  // FIX 3: useMemo — filtered list bhi memoize karo
  const filteredCampaigns = useMemo(() => {
    if (filter === 'All') return campaigns;
    return campaigns.filter(c => c.status === filter);
  }, [campaigns, filter]); // Sirf jab dono change hon

  return (
    <div className="p-6">
      {/* Stats */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-lg font-bold">
          Total Budget: ${totalBudget.toLocaleString()}
        </p>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 mb-4">
        {['All', 'Active', 'Paused', 'Completed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Campaign Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCampaigns.map(campaign => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            onClick={handleCardClick} // FIX 4: Stable reference — child re-render nahi hoga
          />
        ))}
      </div>

      {selectedId && (
        <p className="mt-4 text-sm text-gray-500">
          Selected Campaign ID: {selectedId}
        </p>
      )}
    </div>
  );
}

export default OptimizedDashboard;

/*
=== OPTIMIZATION SUMMARY ===

Problem 1 → Fix: useCallback for event handlers
  - Har render pe naya function nahi banega
  - Child components unnecessarily re-render nahi honge

Problem 2 → Fix: useMemo for expensive calculations
  - totalBudget sirf tab recalculate hoga jab campaigns change hon
  - filteredCampaigns sirf tab filter hoga jab zaroorat ho

Problem 3 → Fix: React.memo for child components
  - CampaignCard sirf tab re-render hoga jab uske props change hon
  - Parent ke dusre state changes se affect nahi hoga

Problem 4 → Fix: Stable function references
  - handleCardClick useCallback se stable hai
  - memo ke saath properly kaam karega

=== HOW TO VERIFY WITH REACT DEVTOOLS ===
1. Chrome mein React DevTools install karo
2. Components tab kholo
3. "Highlight updates when components render" enable karo
4. Filter change karo — sirf affected cards highlight honge
5. Slow version mein sab highlight hote hain (bad)
6. Fast version mein sirf changed cards highlight hote hain (good)
*/