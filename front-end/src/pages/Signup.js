import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import PageTransition from '../PageTransition';
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
            // First, create the auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name // Store name in auth metadata
                    }
                }
            });

            if (authError) throw authError;

            if (authData.user) {
                // Then create the profile in your users table
                const { error: profileError } = await supabase
                    .from('users')
                    .insert([
                        {
                            id: authData.user.id,
                            name: name,
                            email: email
                        }
                    ]);

                if (profileError) throw profileError;

                console.log('Signup successful:', authData);
                navigate('/dashboard');
            }

        } catch (error) {
            console.error('Signup error:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
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
                    onSubmit={handleSignup}
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
                        {error && <div style={{color: 'red'}}>{error}</div>}
                        <input
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        
                        
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