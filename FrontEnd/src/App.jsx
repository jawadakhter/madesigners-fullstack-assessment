// src/App.jsx
import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import AIBriefBuilder from './components/AIBriefBuilder';
import LoginPage from './components/LoginPage';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  // Agar token nahi hai to Login Page dikhao
  if (!token) {
    return <LoginPage onLogin={(t) => setToken(t)} />;
  }

  return (
    <div>
      {activeTab === 'dashboard' ? (
        <Dashboard setActiveTab={setActiveTab} onLogout={handleLogout} />
      ) : (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-10 px-4">
          <button onClick={() => setActiveTab('dashboard')} className="mb-4 text-blue-600 dark:text-blue-400 font-semibold">
            ← Back to Dashboard
          </button>
          <AIBriefBuilder />
        </div>
      )}
    </div>
  );
}

export default App;