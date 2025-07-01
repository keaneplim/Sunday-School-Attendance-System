import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { CheckIn } from './components/CheckIn';
import { Students } from './components/Students';
import { Reports } from './components/Reports';
import { login } from './utils/database'; // Import the new login function

function App() {
  const [currentView, setCurrentView] = useState('checkin');
  const [isAdmin, setIsAdmin] = useState(false);
  
  // --- START: SECURITY IMPROVEMENT ---
  const [adminSecret, setAdminSecret] = useState<string | null>(null);

  const handleLogin = async () => {
    const password = prompt("Please enter the admin password:");
    if (password) {
      const result = await login(password);
      if (result.success && result.secret) {
        setIsAdmin(true);
        setAdminSecret(result.secret);
        setCurrentView('dashboard');
      } else {
        alert("Incorrect password.");
      }
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setAdminSecret(null); // Clear the secret on logout
    setCurrentView('checkin');
  };
  // --- END: SECURITY IMPROVEMENT ---

  const handleViewChange = (view: string) => {
    if (!isAdmin && (view === 'dashboard' || view === 'reports')) {
      alert("You do not have permission to view this page.");
      return;
    }
    setCurrentView(view);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        // Pass the secret to the Dashboard
        return isAdmin && adminSecret ? <Dashboard adminSecret={adminSecret} /> : <CheckIn />;
      case 'checkin':
        return <CheckIn />;
      case 'students':
        // Pass the secret to the Students component
        return <Students adminSecret={adminSecret} />;
      case 'reports':
        return isAdmin ? <Reports /> : <CheckIn />;
      default:
        return <CheckIn />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentView={currentView} 
        onViewChange={handleViewChange}
        isAdmin={isAdmin}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      <main className="min-h-[calc(100vh-4rem)]">
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;