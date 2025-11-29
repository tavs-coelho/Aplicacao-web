import { useState } from 'react';
import Dashboard from './components/Dashboard'
import Login from './components/Login'
import ForgotPassword from './components/ForgotPassword'

// Check for existing session synchronously before first render
function getInitialState() {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  
  if (token && storedUser) {
    try {
      return {
        view: 'dashboard',
        user: JSON.parse(storedUser),
      };
    } catch {
      // Invalid stored user, clear storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
  return { view: 'login', user: null };
}

function App() {
  const initialState = getInitialState();
  const [view, setView] = useState(initialState.view); // 'login', 'forgotPassword', 'dashboard'
  const [user, setUser] = useState(initialState.user);

  const handleLogin = (userData) => {
    setUser(userData);
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setView('login');
  };

  const handleForgotPassword = () => {
    setView('forgotPassword');
  };

  const handleBackToLogin = () => {
    setView('login');
  };

  if (view === 'forgotPassword') {
    return <ForgotPassword onBackToLogin={handleBackToLogin} />;
  }

  if (view === 'dashboard' && user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return <Login onLogin={handleLogin} onForgotPassword={handleForgotPassword} />;
}

export default App
