import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/commons/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import EmailSent from './pages/auth/EmailSent';
import Onboarding from './pages/Onboarding';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/email-sent' element={<EmailSent />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path='/' element={<Dashboard />} />
            <Route path='/onboarding' element={<Onboarding />} />
          </Route>

          {/* Fallback redirect */}
          {/* <Route path='*' element={<Navigate to='/login' replace />} /> */}
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
