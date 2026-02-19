import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Chat from './pages/Chat';
import { useEffect } from 'react';

// ── Auth Callback Component ──
function AuthCallback() {
  const { loginWithToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      loginWithToken(token).then(() => navigate('/chat'));
    } else {
      navigate('/login');
    }
  }, [location, loginWithToken, navigate]);

  return (
    <div className="h-screen bg-dark-900 flex items-center justify-center">
      <div className="text-dark-50">Completing authentication...</div>
    </div>
  );
}

// ── Protected Route Wrapper ──
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
