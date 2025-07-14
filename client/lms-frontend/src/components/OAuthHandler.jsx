import { useEffect, useContext, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authcontext';

const OAuthHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userStr = params.get('user');
    
    console.log('🔍 OAuthHandler - URL params:', { token: !!token, userStr: !!userStr });
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('✅ OAuthHandler - Parsed user:', { 
          _id: user._id, 
          email: user.email, 
          username: user.username,
          isGoogleUser: user.isGoogleUser 
        });
        
        // Remove query params before login/navigation
        window.history.replaceState({}, document.title, location.pathname);
        hasRun.current = true;
        login(user, token);
        navigate('/dashboard', { replace: true });
        return;
      } catch (e) {
        console.error('❌ OAuthHandler - Error parsing user:', e);
        // fallback to old method
      }
    }
    
    // Fallback for old URLs
    const email = params.get('email');
    const username = params.get('username');
    if (token && email && username) {
      console.log('🔄 OAuthHandler - Using fallback method');
      window.history.replaceState({}, document.title, location.pathname);
      hasRun.current = true;
      login({ email, username }, token);
      navigate('/dashboard', { replace: true });
    }
  }, [location, login, navigate]);

  return null;
};

export default OAuthHandler; 