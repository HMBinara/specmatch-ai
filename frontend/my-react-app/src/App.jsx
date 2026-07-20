import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import CompanyNameModal from './components/CompanyNameModal';

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#15181d] flex items-center justify-center">
        <p className="text-[#5b636e] font-mono text-xs">Loading...</p>
      </div>
    );
  }

  return currentUser ? children : <Navigate to="/" replace />;   // <-- "/login" → "/"
}

function AppRoutes() {
  const { needsCompanyName } = useAuth();
  return (
    <>
      {needsCompanyName && <CompanyNameModal />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}