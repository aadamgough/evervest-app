import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import farmImage from '../logos/farm.jpeg';
import PageTransition from '../PageTransition';
import Navbar from '../components/Navbar';
import '../App.css';

function Home() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

        // Set the session in Supabase client
      if (data.session) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        });

        if (sessionError) {
          throw new Error('Failed to set session');
        }
      }

      // Handle successful login
      navigate('/dashboard'); // or wherever you want to redirect
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  // Check for existing session on component mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setInitializing(false);
      }
    };
    checkSession();
  }, [navigate]);

  // Show loading state while checking session
  if (initializing) {
    return (
      <div className="loading-container">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="Home">
        <head>
        </head>
        <body className="body">
          <div id="grain" className="title-container" style={{ position: "relative", overflow: "hidden" }}></div>
          <Navbar isLoggedIn={false} />
          <section className="hero-wrapper">
            <div className="hero-content-container">
              <div className="hero-left">
                <div className="hero-text-container">
                  <h1 className="hero-text">
                    Empower your<br />
                    future sustainably
                  </h1>
                  <p>
                    Evervest is your team's platform for powerful<br />
                    automation, data integration, and seamless<br />
                    collaboration — redefining financial planning<br />
                    and investment decisions.
                  </p>
                </div>
                <div className="email-pass-container">
                  {error && (
                    <div className="error-message">
                      ⚠️ {error}
                    </div>
                  )}
                  <div className="input-wrapper">
                    <input 
                      type="email" 
                      placeholder="Email" 
                      className="email-input"
                      onChange={(e) => setEmail(e.target.value)}
                      value={email}
                    />
                    <input 
                      type="password" 
                      placeholder="Password" 
                      className="password-input"
                      onChange={(e) => setPassword(e.target.value)}
                      value={password}
                    />
                  </div>
                </div>
                <div className="sign-log-in-container">
                  <div className="auth-buttons">
                    <button 
                      className={`auth-btn login-btn ${loading ? 'loading' : ''}`} 
                      onClick={handleLogin}
                      disabled={loading}
                    >
                      {loading ? 'Logging in...' : 'Log In'}
                    </button>
                    <span className="auth-divider">or</span>
                    <button className="auth-btn signup-btn" onClick={handleSignup}>
                      Sign Up
                    </button>
                  </div>
                </div>
              </div>
              <div className="hero-right">
                <img 
                  src={farmImage}
                  alt="Financial planning illustration" 
                  className="hero-image"
                />
              </div>
            </div>
          </section>
        </body>
      </div>
    </PageTransition>
  );
}

export default Home;