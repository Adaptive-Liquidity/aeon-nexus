import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { initStorageDefaults, store, storageController } from './lib/storage';
import { supabase } from './lib/supabase';
import Gate from './pages/Gate';
import Hub from './pages/Hub';
import AskSophiaSurface from './pages/AskSophiaSurface';
import AdminSophiaSurface from './pages/AdminSophiaSurface';
import SophiaLiveSurface from './pages/SophiaLiveSurface';
import PublicHubSurface from './pages/PublicHubSurface';
import LinksSurface from './pages/LinksSurface';
import LaunchSurface from './pages/LaunchSurface';
import StandbySurface from './pages/StandbySurface';
import OverlaySurface from './pages/OverlaySurface';
import './index.css';

function AppContent() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    initStorageDefaults();
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Fetch profile
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (profile) {
          setUser({
            ...profile,
            email: session.user.email,
            name: profile.callsign,
            verified: true,
            tasks: {}, // Keep default tasks obj to prevent crashes
          });
        }
      } else {
        // Fallback to local storage for backward compatibility with existing tokens (Phase 3 transition)
        const u = await store.get("activ8-user");
        if (u && u.verified) setUser(u);
      }
      setLoading(false);
    };

    checkSession();
  }, []);

  if (loading) return null;

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/hub" /> : <Gate onComplete={setUser} />} />
      <Route path="/overlay" element={<OverlaySurface />} />
      <Route path="/*" element={<Hub user={user} setUser={setUser} />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
