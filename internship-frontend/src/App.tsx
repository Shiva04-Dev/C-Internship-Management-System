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

/* --- Types --- */
type UserType = 'Student' | 'Company' | 'Admin';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserType[];
}

/* --- Protected Route --- */
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

/* --- App Routes --- */
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

/* --- App Shell ---
 * Everything that must live OUTSIDE `ScrollSmootherProvider`. GSAP's
 * ScrollSmoother puts a CSS `transform` on `#smooth-content`, which makes
 * that div the containing block for every `position: fixed` descendant — so
 * anything fixed-positioned rendered inside it (the custom cursor, toasts)
 * would scroll away with the page instead of staying pinned to the viewport.
 * Both siblings below are deliberately kept out of that subtree.
 *
 * `AppToaster` is mounted here exactly ONCE for the whole app rather than
 * per-page. Previously each dashboard mounted its own, which meant
 * LoginPage and RegisterPage — which both call `toast.success`/`toast.error`
 * — had no <Toaster> at all and their toasts rendered nowhere. The accent is
 * derived from the route so /admin keeps its red border and every other page
 * gets the cyan default, which is the only thing the per-page mounts varied.
 *
 * This lives in its own component (not in `App`) because `useLocation()` is
 * only legal below `<Router>`, and `App` is what renders `<Router>`.
 */
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

/* --- Main App --- */
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