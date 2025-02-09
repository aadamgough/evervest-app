import { Link } from 'react-router-dom';
import { useState } from 'react';
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

  const handleLogin = async (e) => {
      e.preventDefault();
      setError('');
      
      try {
          const { data, error } = await supabase.auth.signInWithPassword({
              email,
              password
          });

          if (error) throw error;

          console.log('Login successful:', data);
          navigate('/dashboard');
          
      } catch (error) {
          console.error('Login error:', error);
          setError(error.message || 'Failed to login. Please check your credentials.');
      }
  };

  const handleSignup = () => {
      navigate('/signup');
  };

    return (
      <PageTransition>
      <div className="Home">
        <head>
        </head>
        <body class="body">
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
                  <div className="input-wrapper">
                    <input 
                      type="email" 
                      placeholder="Email" 
                      className="email-input"
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <input 
                      type="password" 
                      placeholder="Password" 
                      className="password-input"
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <div className="sign-log-in-container">
                  <div className="auth-buttons">
                    <button className="auth-btn login-btn" onClick={handleLogin}>Log In</button>
                    <span className="auth-divider">or</span>
                    <button className="auth-btn signup-btn" onClick={handleSignup}>Sign Up</button>
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