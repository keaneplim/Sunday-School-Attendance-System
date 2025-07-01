import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { CheckIn } from './components/CheckIn';
import { Students } from './components/Students';
import { Reports } from './components/Reports';
import { Login } from './components/Login';
import { AdminLoginModal } from './components/AdminLoginModal';
// Import both login functions
import { login as apiLogin, adminLogin as apiAdminLogin } from './utils/database';

function App() {
  const [currentView, setCurrentView] = useState('checkin');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminSecret, setAdminSecret] = useState<string | null>(null);
  const [loginError, setLoginError] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // Initial login handler
  const handleLogin = async (password: string) => {
    const result = await apiLogin(password);
    if (result.success) {
      setIsAuthenticated(true);
      // This will now always be false on initial login
      setIsAdmin(result.isAdmin);
      setAdminSecret(result.secret || null);
      setLoginError('');
      setCurrentView('checkin');
    } else {
      setLoginError("The password you entered is incorrect.");
    }
  };

  // Admin privilege escalation handler
  const handleAdminLogin = async (password: string) => {
    if (!adminSecret) {
        alert("Authentication error. Please log out and try again.");
        return;
    }
    // Use the new admin login function
    const result = await apiAdminLogin(password, adminSecret);
    if (result.success && result.isAdmin) {
      setIsAdmin(true);
      // The secret might be the same, but we update it just in case
      setAdminSecret(result.secret || null);
      setShowAdminLogin(false);
      setCurrentView('dashboard');
    } else {
      alert("Incorrect admin password.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    setAdminSecret(null);
    setCurrentView('checkin');
  };
  
  const handleViewChange = (view: string) => {
    if (!isAdmin && (view === 'dashboard' || view === 'reports')) {
      alert("You must be an admin to view this page.");
      return;
    }
    setCurrentView(view);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return isAdmin && adminSecret ? <Dashboard adminSecret={adminSecret} /> : <CheckIn />;
      case 'checkin':
        return <CheckIn />;
      case 'students':
        return <Students adminSecret={adminSecret} isAdmin={isAdmin} />;
      case 'reports':
        return isAdmin ? <Reports /> : <CheckIn />;
      default:
        return <CheckIn />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} loginError={loginError} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentView={currentView}
        onViewChange={handleViewChange}
        isAdmin={isAdmin}
        onAdminLoginClick={() => setShowAdminLogin(true)}
        onLogout={handleLogout}
      />

      {showAdminLogin && (
        <AdminLoginModal
          onLogin={handleAdminLogin}
          onClose={() => setShowAdminLogin(false)}
        />
      )}

      <main className="min-h-[calc(100vh-4rem)]">
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;