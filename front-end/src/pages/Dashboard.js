import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageTransition from '../PageTransition';
import '../App.css';

function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    
    // Get today's date in a nice format
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    useEffect(() => {
        // Check for user data when component mounts
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        } else {
            // Redirect to login if no user data found
            navigate('/');
        }
    }, [navigate]);

    return (
        <PageTransition>
        <div className="Dashboard">
            {/* Header and Navbar */}
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
                        <Link to="/dashboard" className="nav-text-link">Home</Link>
                        </div>
                        <div className="dropdown">
                        <Link to="/solutions" className="nav-text-link">Investments</Link>
                        <div className="dropdown-content">
                            <Link to="/solution1">Portfolio 1</Link>
                            <Link to="/solution2">Portfolio 2</Link>
                        </div>
                        </div>
                        <div className="dropdown">
                        <Link to="/resources" className="nav-text-link">Profile</Link>
                        </div>
                        <Link to="/questionnaire" className="nav-text-link">Questionnaires</Link>
                    </div>
                    <div className="nav-actions" style={{ marginLeft: 'auto' }}>
                        <Link to="/contact-sales" className="nav-action-link">Contact Support</Link>
                        <Link to="/signup" className="signup-button">Logout</Link>
                    </div>
                    </nav>
                </div>
                <div class="w-nav-overlay"></div>
            </div>

            </header>
            <div className="dashboard-content">
                <div className="welcome-section">
                    <h1>Hello, {user ? user.name : 'User'}</h1>
                    <p className="date">{today}</p>
                </div>

                <div className="action-buttons-container">
                    <div className="action-item">
                        <div className="action-description">
                            <p>
                            Discover your unique investment path. Take a quick 
                            questionnaire tailored to your needs—whether it's 
                            wealth management, risk tolerance, or ESG preferences—and 
                            get personalized insights to guide your financial future.
                            </p>
                        </div>
                        <button 
                            className="dashboard-btn"
                            onClick={() => navigate('/questionnaire')}
                        >
                            Go to Questionnaires
                        </button>
                    </div>

                    <div className="action-item">
                        <div className="action-description">
                            <p>
                            Review your personalized insights and track how your 
                            preferences shape your investment strategy. Access your 
                            responses anytime to stay aligned with your financial goals.
                            </p>
                        </div>
                        <button 
                            className="dashboard-btn"
                            onClick={() => {/* Add navigation logic */}}
                        >
                            View my Responses
                        </button>
                    </div>
                </div>
            </div>
        </div>
        </PageTransition>
    );
}

export default Dashboard;