import { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppToaster from './motion/AppToaster';
import CustomCursor from './motion/CustomCursor';
import ScrollSmootherProvider from './motion/ScrollSmootherProvider';
import PageTransition from './motion/PageTransition';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import InternshipDetails from './pages/InternshipDetails';

type UserType = 'Student' | 'Company' | 'Admin';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserType[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center flex-col gap-4" 
        style={{ background: '#050510' }}
      >
        <div 
          className="retro-spinner" 
          style={{ width: '48px', height: '48px' }} 
        />
        <p 
          className="font-['Orbitron'] text-xs tracking-widest" 
          style={{ color: 'rgba(0,243,255,0.5)', letterSpacing: '0.2em' }}
        >
          AUTHENTICATING...
        </p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(user.userType)) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <PageTransition locationKey={location.pathname}>
    <Routes location={location}>
      <Route path="/" element={<LandingPage />} />
      <Route 
        path="/login" 
        element={user ? <Navigate to={`/${user.userType.toLowerCase()}`} /> : <LoginPage />} 
      />
      <Route 
        path="/register" 
        element={user ? <Navigate to={`/${user.userType.toLowerCase()}`} /> : <RegisterPage />} 
      />
      <Route 
        path="/student" 
        element={
          <ProtectedRoute allowedRoles={['Student']}>
            <StudentDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/internship/:id" 
        element={
          <ProtectedRoute allowedRoles={['Student']}>
            <InternshipDetails />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/company" 
        element={
          <ProtectedRoute allowedRoles={['Company']}>
            <CompanyDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
    </PageTransition>
  );
}

// Outside ScrollSmootherProvider — its transform on #smooth-content would make
// fixed descendants (cursor, toasts) scroll with the page. Split out since useLocation() needs <Router>.
function AppShell() {
  const location = useLocation();

  return (
    <>
      <CustomCursor />
      <AppToaster accent={location.pathname.startsWith('/admin') ? 'red' : 'cyan'} />
      <ScrollSmootherProvider>
        <AppRoutes />
      </ScrollSmootherProvider>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </Router>
  );
}

export default App;