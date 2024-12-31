import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
        <div className="Dashboard">
            {/* Header and Navbar */}
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
                    <Link to="/dashboard" className="nav-text-link">Dashboard</Link>
                    <Link to="/investments" className="nav-text-link">My Investments</Link>
                    <Link to="/profile" className="nav-text-link">Profile</Link>
                </div>
              </nav>
            </div>
            <div class="w-nav-overlay"></div>
          </div>

            </header>

            {/* Main Content */}
            <div className="dashboard-content">
                <div className="welcome-section">
                    <h1 style={{fontFamily: 'Madeinfinity-regular'}}>Hello, {user ? user.name : 'User'}</h1>
                    <p className="date" style={{fontFamily: 'Madeinfinity-regular'}}>{today}</p>
                </div>

                <div className="action-buttons-container">
                    <div className="action-item">
                        <div className="action-description">
                            <p style={{fontFamily: 'Madeinfinity-regular'}}>
                            Discover your unique investment path. Take a quick 
                            questionnaire tailored to your needs—whether it's 
                            wealth management, risk tolerance, or ESG preferences—and 
                            get personalized insights to guide your financial future.
                            </p>
                        </div>
                        <button 
                            className="dashboard-btn"
                            onClick={() => navigate('/questionnaire')}
                            style={{fontFamily: 'Madeinfinity-regular'}}
                        >
                            Go to Questionnaires
                        </button>
                    </div>

                    <div className="action-item">
                        <div className="action-description">
                            <p style={{fontFamily: 'Madeinfinity-regular'}}>
                            Review your personalized insights and track how your 
                            preferences shape your investment strategy. Access your 
                            responses anytime to stay aligned with your financial goals.
                            </p>
                        </div>
                        <button 
                            className="dashboard-btn"
                            onClick={() => {/* Add navigation logic */}}
                            style={{fontFamily: 'Madeinfinity-regular'}}
                        >
                            View my Responses
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;