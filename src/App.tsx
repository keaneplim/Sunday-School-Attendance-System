import React, { useState } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { CheckIn } from './components/CheckIn';
import { Students } from './components/Students';
import { Reports } from './components/Reports';
import { Login } from './components/Login';
import { login as apiLogin } from './utils/database';

function App() {
  const [currentView, setCurrentView] = useState('checkin');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminSecret, setAdminSecret] = useState<string | null>(null);
  const [loginError, setLoginError] = useState('');

const handleLogin = async (password: string) => {
    const result = await apiLogin(password);
    if (result.success) {
      setIsAuthenticated(true);
      setIsAdmin(result.isAdmin);
      // Only set the secret if the user is an admin
      if (result.isAdmin && result.secret) {
        setAdminSecret(result.secret);
      } else {
        // For teachers, we can set a non-admin secret token if the backend provides one
        // Or ensure it's null if they are not admin
        setAdminSecret(result.secret || null);
      }
      setLoginError('');
      setCurrentView('checkin');
    } else {
      setLoginError("The password you entered is incorrect.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    setAdminSecret(null);
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
        // Both teachers and admins get a secret now to add students
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
        onLogin={() => {}} // Not used from header anymore
        onLogout={handleLogout}
      />
      <main className="min-h-[calc(100vh-4rem)]">
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;