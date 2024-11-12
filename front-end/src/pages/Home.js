import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import googleLogo from '../logos/google.png';
import facebookLogo from '../logos/facebook.png';
import xLogo from '../logos/x.png';
import '../App.css';

function Home() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const authenticateUser = async (email, password) => {
      try {
          const response = await fetch('http://localhost:5001/login', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
              },
              body: JSON.stringify({ email, password }),
              credentials: 'include' // This is important if you're using cookies for sessions
          });
  
          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Authentication failed');
          }
  
          const data = await response.json();
          
          // Store the token if your backend sends one
          if (data.token) {
              localStorage.setItem('authToken', data.token);
          }
          
          return true;
      } catch (error) {
          console.error('Authentication error:', error);
          throw error; // This will allow the handleLogin function to catch and display the error
      }
    };
    
    const handleLogin = async (e) => {
      e.preventDefault();
      setError('');
      
      try {
          await authenticateUser(email, password);
          navigate('/dashboard');
      } catch (error) {
          console.error('Login error:', error);
          setError(error.message || 'Failed to login. Please check your credentials.');
      }
    };

    const handleSignup = () => {
        navigate('/signup'); // Redirect to signup form
    };

    return (
      <div className="Home">
        <head>
  
        </head>
        <body class="body">
          <div id="grain" className="title-container" style={{ position: "relative", overflow: "hidden" }}></div>
          <div class="navbar w-nav">
            <div class="nav-container w-container">
                <Link to="/" className="logo w-nav-brand w--current">
                    <div className="name-text">
                        <h1>Evervest FP</h1>
                    </div>
                </Link>
              <nav role="navigation" class="nav-menu w-nav-menu">
                <div class="nav-div-left">
                    <Link to="/our-story" className="nav-text-link">Our Story</Link>
                    <Link to="/our-team" className="nav-text-link">Our Team</Link>
                    <Link to="/contact" className="nav-text-link">Contact Us</Link>
                </div>
              </nav>
            </div>
            <div class="w-nav-overlay"></div>
          </div>
          <section class="hero-wrapper">
            <div class="hero-div">
              <p class="hero-text">
                  Evervest Financial Planning
              </p>
              <h1>
                Empower your future sustainably.
              </h1>
            </div>
          </section>
          <div class="email-pass-container">
            <div class="input-wrapper">
              <input 
                type="email" 
                placeholder="Enter your email" 
                class="email-input"
                onChange={(e) => setEmail(e.target.value)}
                style={{fontFamily: 'Madeinfinity-regular'}}
              />
              <input 
                type="password" 
                placeholder="Enter your password" 
                class="password-input"
                onChange={(e) => setPassword(e.target.value)}
                style={{fontFamily: 'Madeinfinity-regular'}}
              />
            </div>
          </div>
          <div class="sign-log-in-container">
            <div style={{fontFamily: 'Madeinfinity-regular'}} class="auth-buttons">
              <button class="auth-btn login-btn" onClick={handleLogin}>Log In</button>
              <span class="auth-divider">or</span>
              <button class="auth-btn signup-btn" onClick={handleSignup}>Sign Up</button>
            </div>
            <div style={{fontFamily: 'Madeinfinity-regular'}} class="social-login">
              <p class="social-text">Or continue with</p>
            </div>
          </div>
          <div class="socials-container">
            <div class="social-buttons">
              <button class="social-btn">
                <img src={googleLogo} alt="Google" />
              </button>
              <button class="social-btn">
                <img src={facebookLogo} alt="Facebook" />
              </button>
              <button class="social-btn">
                <img src={xLogo} alt="X" />
              </button>
            </div>
          </div>
      </body>
      </div>
    );
  }
  
  export default Home;