// src/App.jsx
import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import AIBriefBuilder from './components/AIBriefBuilder';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div>
      {activeTab === 'dashboard' ? (
        <Dashboard setActiveTab={setActiveTab} />
      ) : (
        // Wrapper with Layout structure so Sidebar persists (simplified here)
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-10 px-4">
           <button onClick={() => setActiveTab('dashboard')} className="mb-4 text-blue-600 dark:text-blue-400 font-semibold">← Back to Dashboard</button>
           <AIBriefBuilder />
        </div>
      )}
    </div>
  );
}

export default App;