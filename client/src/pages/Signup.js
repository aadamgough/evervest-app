import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import PageTransition from '../PageTransition';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';


function Signup() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password })
            });
            
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            
            // Handle successful signup
            // Redirect to login, show success message, etc.
        } catch (error) {
            console.error('Signup error:', error);
        }
    };

    return (
        <PageTransition>
        <div className="Signup">
            {/* Add the header section similar to Home */}
            <header className="header">
                <Navbar isLoggedIn={false} />
            </header>

            {/* Main signup content */}
            <div className="email-pass-container">
                <div className="input-wrapper">
                    <h1 style={{ textAlign: 'center', marginBottom: '20px'}}>
                        Create Your Account
                    </h1>

                    <form onSubmit={handleSignup} className="auth-form">
                        {error && (
                            <div className="error-message">
                                <span>⚠️</span> {error}
                            </div>
                        )}
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="auth-input"
                                required
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="auth-input"
                                required
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="auth-input"
                                required
                            />
                        </div>
                        <div className="auth-links">
                            <p>Already have an account? <Link to="/" className="auth-link">Login</Link></p>
                        </div>
                        
                        <div className="sign-log-in-container">
                            <div className="auth-buttons">
                                <button 
                                    type="submit" 
                                    className="auth-btn signup-btn"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Creating Account...' : 'Create Account'}
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