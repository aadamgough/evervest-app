import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const Navbar = ({ isLoggedIn }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            navigate('/');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <div className="navbar w-nav">
            <div className="nav-container w-container">
                <Link to="/" className="logo w-nav-brand w--current">
                    <div className="name-text">
                        <h1>Evervest</h1>
                    </div>
                </Link>
                <nav role="navigation" className="nav-menu w-nav-menu">
                    {isLoggedIn ? (
                        // Logged in navigation
                        <>
                            <div className="nav-links" style={{ marginRight: 'auto' }}>
                                <div className="dropdown">
                                    <Link to="/dashboard" className="nav-text-link">Home</Link>
                                </div>
                                <div className="dropdown">
                                    <Link to="/investments" className="nav-text-link">Investments</Link>
                                </div>
                                <div className="dropdown">
                                    <Link to="/resources" className="nav-text-link">Profile</Link>
                                </div>
                                <Link to="/questionnaire" className="nav-text-link">Questionnaires</Link>
                            </div>
                            <div className="nav-actions" style={{ marginLeft: 'auto' }}>
                                <Link to="/contact-sales" className="nav-action-link">Contact Support</Link>
                                <button 
                                    onClick={handleLogout} 
                                    className="signup-button"
                                    style={{ border: 'none', cursor: 'pointer' }}
                                >
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        // Non-logged in navigation
                        <>
                            <div className="nav-links" style={{ marginRight: 'auto' }}>
                                <div className="dropdown">
                                    <Link to="/product" className="nav-text-link">Product</Link>

                                </div>
                                <div className="dropdown">
                                    <Link to="/solutions" className="nav-text-link">Solutions</Link>
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
                                <Link to="/signup" className="signup-button">Sign up</Link>
                            </div>
                        </>
                    )}
                </nav>
            </div>
            <div className="w-nav-overlay"></div>
        </div>
    );
};

export default Navbar;