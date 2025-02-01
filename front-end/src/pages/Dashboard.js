import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import PageTransition from '../PageTransition';
import '../App.css';

function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Get today's date in a nice format
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    useEffect(() => {
        // Check for authenticated user and fetch their data
        const getUser = async () => {
            try {
                // Get the current session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                
                if (sessionError) throw sessionError;

                if (!session) {
                    navigate('/');
                    return;
                }

                // Fetch user profile from your users table
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (userError) throw userError;

                setUser(userData);
            } catch (error) {
                console.error('Error fetching user:', error);
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        getUser();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            
            navigate('/');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <PageTransition>
        <div className="Dashboard">
            {/* Header and Navbar */}
            <header className="header">
            <div className="navbar w-nav">
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
                        <button 
                            onClick={handleLogout} 
                            className="signup-button"
                            style={{ border: 'none', cursor: 'pointer' }}
                        >
                            Logout
                        </button>
                    </div>
                    </nav>
                </div>
                <div className="w-nav-overlay"></div>
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