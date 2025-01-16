import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PageTransition from '../PageTransition';
import '../App.css'

function Signup() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        // Add other fields as needed
    });
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const createAccount = async (data) => {
        console.log('Sending signup data:', data); // Debug log
        
        try {
            const response = await fetch('http://localhost:5001/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    password: data.password
                })
            });
    
            const responseData = await response.json();
            console.log('Server response:', responseData); // Debug log
            
            if (!response.ok) {
                throw new Error(responseData.message || 'Signup failed');
            }
    
            return responseData;
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null); // Clear any previous messages
        
        try {
            const success = await createAccount(formData);
            if (success) {
                setSuccessMessage('Successfully signed up!');
                // Wait for 2 seconds before redirecting to show the success message
                setTimeout(() => {
                    navigate('/dashboard'); 
                }, 2000);
            }
        } catch (error) {
            console.error('Signup error in handleSubmit:', error);
            setError('An error occurred during signup.');
        }
    };

    return (
        <PageTransition>
        <div className="Signup">
            {/* Add the header section similar to Home */}
            <header className="header">
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
            </header>

            {/* Main signup content */}
            <div className="email-pass-container">
                <div className="input-wrapper">
                    <h2 style={{ textAlign: 'center', marginBottom: '20px'}}>
                        Create Your Account
                    </h2>
                    <form 
                    onSubmit={handleSubmit}
                    style={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%',
                        maxWidth: '400px',
                        margin: '0 auto'
                    }}
                    >
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Full Name"
                            className="email-input"
                            style={{ marginBottom: '10px'}}
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email"
                            className="email-input"
                            style={{ marginBottom: '10px'}}
                            required
                        />
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Password"
                            className="password-input"
                            style={{ marginBottom: '20px'}}
                            required
                        />
                        {error && <div className="error-message" style={{color: 'red'}}>{error}</div>}
                        {successMessage && <div className="success-message" style={{color: 'green'}}>{successMessage}</div>}
                        
                        <div className="sign-log-in-container">
                            <div className="auth-buttons">
                                <button type="submit" className="auth-btn signup-btn">
                                    Create Account
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        </PageTransition>
    );
}

export default Signup;