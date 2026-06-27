import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// Import the components
import Auth from './components/Auth';
import RecipeSearch from './components/RecipeSearch';

function App() {
  const [user, setUser] = useState(localStorage.getItem('user_id'));

  useEffect(() => {
    const savedUser = localStorage.getItem('user_id');
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    setUser(null);
  };

  return (
    <Router>
      {user && (
        <nav className="navbar navbar-dark bg-dark px-4 shadow">
          <span className="navbar-brand mb-0 h1">🔥 AI Kitchen Concierge</span>
          <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      )}

      <div className="container-fluid p-0">
        <Routes>
          {/* Home Route: Show Auth if not logged in */}
          <Route 
            path="/" 
            element={!user ? <Auth setUser={setUser} /> : <Navigate to="/search" />} 
          />

          {/* Search Route: Show ML Search if logged in */}
          <Route 
            path="/search" 
            element={user ? <RecipeSearch /> : <Navigate to="/" />} 
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;