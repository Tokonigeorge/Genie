// src/pages/auth/AuthCallback.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        // Check if this is a new user (from email confirmation)
        const isNewUser = session.user.user_metadata?.isNewUser;

        if (isNewUser) {
          // Clear the new user flag
          await supabase.auth.updateUser({
            data: { isNewUser: false },
          });
          navigate('/onboarding');
        } else {
          navigate('/');
        }
      } else {
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate]);

  return <div>Loading...</div>;
};

export default AuthCallback;
