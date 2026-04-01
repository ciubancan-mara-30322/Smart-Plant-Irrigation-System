import { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard'; 
import './App.css';
import background from './assets/bkg_log.jpeg';
import background_dash from './assets/bkg_dashboard.jpeg';
import { LogOut } from 'lucide-react';


function App() {
  // Initialize the token from localStorage
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [showRegister, setShowRegister] = useState(false);

  const logout = () => {
    // Delete everything related to the session
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // IMPORTANT: Delete also the user details
    setToken(null);
  };

  // --- Login logic---

  // 1. If the user IS logged in
  if (token) {
    return (
      <div 
        className="app-container" 
        style={{ 
          backgroundImage: `url(${background_dash})`,
          backgroundSize: 'cover', 
          backgroundPosition: 'bottom',
          backgroundAttachment: 'fixed', 
          minHeight: '100vh',
          backgroundRepeat: 'no-repeat',
          width: '100%',
        }}
      >
        <nav className="top-nav">
          <div className="nav-logo">🌱 SproutJoy</div>
          <button className="logout-btn" onClick={logout}>
          <LogOut size={18} />
          Disconnect
        </button>
        </nav>
        <Dashboard />
      </div>
    );
  }

  // 2. If the user is NOT logged in (Display Login or Register)
  return (
   <div 
      className="auth-page" 
      style={{ 
        backgroundImage: `url(${background})` 
      }}
    >
      {showRegister ? (
        <Register switchToLogin={() => setShowRegister(false)} />
      ) : (
        <Login 
          setToken={setToken} 
          switchToRegister={() => setShowRegister(true)} 
        />
      )}
    </div>
  );
}

export default App;