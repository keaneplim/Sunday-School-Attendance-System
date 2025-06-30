import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { CheckIn } from './components/CheckIn';
import { Students } from './components/Students';
import { Reports } from './components/Reports';


const ADMIN_PASSWORD = "rpcckidsmedan"; // You can change this password
export const ADMIN_PASSWORD_CLEAR_DATA = "IAMSURETHATIWANTTOCLEARTHEDATA";

function App() {
  const [currentView, setCurrentView] = useState('checkin');
  const [isAdmin, setIsAdmin] = useState(false); // New state to track if admin is logged in

  const handleLogin = () => {
    const password = prompt("Please enter the admin password:");
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setCurrentView('dashboard'); // Go to dashboard on successful login
    } else if (password) { // If they entered a password but it was wrong
      alert("Incorrect password.");
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setCurrentView('checkin'); // Go back to checkin view on logout
  };
  
  const handleViewChange = (view: string) => {
    // Prevent non-admins from accessing restricted pages
    if (!isAdmin && (view === 'dashboard' || view === 'reports')) {
      alert("You do not have permission to view this page.");
      return;
    }
    setCurrentView(view);
  };


  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        // Only show dashboard if admin
        return isAdmin ? <Dashboard /> : <CheckIn />;
      case 'checkin':
        return <CheckIn />;
      case 'students':
        return <Students />;
      case 'reports':
        // Only show reports if admin
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