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
      console.log('Starting authentication...'); // Debug log
      try {
          const response = await fetch('http://localhost:5001/api/login', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
              },
              body: JSON.stringify({ email, password }),
              credentials: 'include'
          });
  
          const data = await response.json();
          console.log('Server response:', data); // Debug log
          
          if (!response.ok) {
              throw new Error(data.message || 'Authentication failed');
          }
  
          // Store user data and return the data
          if (data.user) {
              localStorage.setItem('user', JSON.stringify(data.user));
              return data;
          } else {
              throw new Error('No user data received');
          }
      } catch (error) {
          console.error('Authentication error:', error);
          throw error;
        }
    };
    
    const handleLogin = async (e) => {
      e.preventDefault();
      setError('');
      
      try {
          const response = await authenticateUser(email, password);
          console.log('Login response:', response);
          
          // Store user info in localStorage
          localStorage.setItem('user', JSON.stringify(response.user));
          
          navigate('/dashboard');
      } catch (error) {
          console.error('Login handler error:', error);
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
            <div className="nav-container w-container">
                <Link to="/" className="logo w-nav-brand w--current">
                  <div className="name-text">
                    <h1>Evervest</h1>
                  </div>
                </Link>
                <nav role="navigation" className="nav-menu w-nav-menu">
                  <div className="nav-links" style={{ marginRight: 'auto' }}>
                    <div className="dropdown">
                      <Link to="/product" className="nav-text-link">Product</Link>
                      <div className="dropdown-content">
                        <Link to="/feature1">Feature 1</Link>
                        <Link to="/feature2">Feature 2</Link>
                      </div>
                    </div>
                    <div className="dropdown">
                      <Link to="/solutions" className="nav-text-link">Solutions</Link>
                      <div className="dropdown-content">
                        <Link to="/solution1">Solution 1</Link>
                        <Link to="/solution2">Solution 2</Link>
                      </div>
                    </div>
                    <div className="dropdown">
                      <Link to="/resources" className="nav-text-link">Resources</Link>
                      <div className="dropdown-content">
                        <Link to="/blog">Blog</Link>
                        <Link to="/faq">FAQ</Link>
                      </div>
                    </div>
                    <Link to="/enterprise" className="nav-text-link">Enterprise</Link>
                    <Link to="/pricing" className="nav-text-link">Pricing</Link>
                  </div>
                  <div className="nav-actions" style={{ marginLeft: 'auto' }}>
                    <Link to="/contact-sales" className="nav-action-link">Contact Sales</Link>
                    <Link to="/login" className="nav-action-link">Login</Link>
                    <Link to="/signup" className="signup-button">Sign up</Link>
                  </div>
                </nav>
            </div>
            <div class="w-nav-overlay"></div>
          </div>
          <section className="hero-wrapper">
            <div className="hero-content-container">
              {/* Left side - Login content */}
              <div className="hero-left">
                <div className="hero-text-container">
                  <p className="hero-text">
                    Evervest Financial Planning
                  </p>
                  <h1>
                    Empower your future sustainably.
                  </h1>
                </div>
                <div className="email-pass-container">
                  <div className="input-wrapper">
                    <input 
                      type="email" 
                      placeholder="Enter your email" 
                      className="email-input"
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <input 
                      type="password" 
                      placeholder="Enter your password" 
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

              {/* Right side - Image */}
              <div className="hero-right">
                <img 
                  src="/path-to-your-image.jpg" 
                  alt="Financial planning illustration" 
                  className="hero-image"
                />
              </div>
            </div>
          </section>
        
      </body>
      </div>
    );
  }
  
  export default Home;