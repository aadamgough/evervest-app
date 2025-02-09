import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import PageTransition from '../PageTransition';
import Navbar from '../components/Navbar';
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
                <Navbar isLoggedIn={true}/>
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

                    <div className="action-item">
                        <div className="action-description">
                            <p>
                            Ready to build an investment plan personalized to your data?
                            Generate custom portfolios for a range of account types, approved
                            and optimized by Evervest's financial advisors.
                            </p>
                        </div>
                        <button 
                            className="dashboard-btn"
                            onClick={() => navigate('/HandleQuestionnaireSubmission')}
                        >
                            Generate Investment Plan
                        </button>
                    </div>
                </div>
            </div>
        </div>
        </PageTransition>
    );
}

export default Dashboard;