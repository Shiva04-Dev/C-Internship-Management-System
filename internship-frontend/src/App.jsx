import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import {AuthProvider, useAuth} from './context/AuthContext';
import {DarkModeProvider} from './context/DarkModeContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import InternshipDetails from './pages/InternshipDetails';

//Protected Route Component
const ProtectedRoute = ({children, allowedRoles}) => {
  const {user, loading} = useAuth();

  if (loading) {
    return (
      <div className = "min-h-screen flex items-center justify-center">
        <div className = "animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to = "/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.userType)) {
    return <Navigate to = "/" />;
  }

  return children;
};

function AppRoutes() {
  const {user} = useAuth();

  return(
    <Routes>
      <Route path = "/" element= {<LandingPage />} />
      <Route path = "/login" element = {user ? <Navigate to = {`/${user.userType.toLowerCase()}`} /> : <LoginPage />} />
      <Route path = "/register" element = {user ? <Navigate to = {`/${user.userType.toLowerCase()}`} /> : <RegisterPage />} />

      <Route 
      path = "/student"
      element = {
        <ProtectedRoute allowedRoles = {['Student']}>
          <StudentDashboard />
        </ProtectedRoute>
      }
      />
      <Route
      path = "/internship/:id"
      element = {
        <ProtectedRoute allowedRoles = {['Student']}>
          <InternshipDetails />
        </ProtectedRoute>
      }
      />

      <Route 
      path = "/company"
      element = {
        <ProtectedRoute allowedRoles = {['Company']}>
          <CompanyDashboard />
        </ProtectedRoute>
      }
      />

      <Route 
      path = "/admin"
      element = {
        <ProtectedRoute allowedRoles = {['Admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      }
      />

      {/*404*/}
      <Route path = "*" element = {<Navigate to = "/" />} />

    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <DarkModeProvider>
          <AppRoutes />
        </DarkModeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;