import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { CheckIn } from './components/CheckIn';
import { Students } from './components/Students';
import { Reports } from './components/Reports';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'checkin':
        return <CheckIn />;
      case 'students':
        return <Students />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      <main className="min-h-[calc(100vh-4rem)]">
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;