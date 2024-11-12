import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
            console.error('Signup error:', error);
            setError('An error occurred during signup.');
        }
    };

    const createAccount = async (data) => {
        try {
            const response = await fetch('http://localhost:5001/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Signup failed');
            }

            const responseData = await response.json();
            
            // Store the token if your backend sends one
            if (responseData.token) {
                localStorage.setItem('authToken', responseData.token);
            }

            return true;
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    };

    return (
        <div className="Signup">
            {/* Add the header section similar to Home */}
            <header className="header">
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
            </header>

            {/* Main signup content */}
            <div className="email-pass-container">
                <div className="input-wrapper">
                    <h2 style={{fontFamily: 'Madeinfinity-regular', textAlign: 'center', marginBottom: '20px'}}>
                        Create Your Account
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Full Name"
                            className="email-input"
                            style={{fontFamily: 'Madeinfinity-regular', marginBottom: '10px'}}
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email"
                            className="email-input"
                            style={{fontFamily: 'Madeinfinity-regular', marginBottom: '10px'}}
                            required
                        />
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Password"
                            className="password-input"
                            style={{fontFamily: 'Madeinfinity-regular', marginBottom: '20px'}}
                            required
                        />
                        {error && <div className="error-message" style={{color: 'red'}}>{error}</div>}
                        {successMessage && <div className="success-message" style={{color: 'green'}}>{successMessage}</div>}
                        
                        <div className="sign-log-in-container">
                            <div style={{fontFamily: 'Madeinfinity-regular'}} className="auth-buttons">
                                <button type="submit" className="auth-btn signup-btn">
                                    Create Account
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Signup;