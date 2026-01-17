import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { supabase } from './lib/supabase';
import Home from './components/Home/Home';
import ProfileForm from './components/StudentProfile/ProfileForm';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import Header from './components/Layout/Header';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and subscribe to auth changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (user) => {
    setUser(user);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-apple-50 to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-apple-600 font-sf">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-apple-50 font-sf">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#1e293b',
              borderRadius: '12px',
              boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.1)',
              fontFamily: '-apple-system, BlinkMacSystemFont, San Francisco, Helvetica Neue, sans-serif',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />
        
        <Routes>
  <Route path="/" element={<Home />} />
  <Route path="/profile" element={<ProfileForm />} />
  <Route
    path="/login"
    element={
      user ? (
        <Navigate to="/dashboard" replace />
      ) : (
        <Login onLogin={handleLogin} />
      )
    }
  />
  <Route
    path="/dashboard/*"
    element={
      user ? (
        <>
          <Header user={user} onLogout={handleLogout} title="Information Technology Ethics, Policy & Security" />
          <Dashboard user={user} />
        </>
      ) : (
        <Navigate to="/login" replace />
      )
    }
  />
</Routes>
      </div>
    </Router>
  );
}

export default App;