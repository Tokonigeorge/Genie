import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        navigate('/onboarding');
      } else {
        navigate('/login');
      }
    }
  }, [user, loading, navigate]);

  return <div>Loading...</div>;
};

export default AuthCallback;
