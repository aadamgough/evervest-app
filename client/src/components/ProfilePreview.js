import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useLocation } from 'react-router-dom';
import '../styles/ProfilePreview.css'; 

function ProfilePreview({ user, linkedAccounts, onLinkAccount }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const location = useLocation();
    useEffect(() => {
        // Get the URL search params
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        // If we have both code and state, handle the callback
        if (code && state) {
            handleOAuthCallback(code, state);
            
            // Clean up URL parameters
            window.history.replaceState({}, '', location.pathname);
        }
    }, [location]);

    const handleLinkAccount = () => {
        setShowModal(true);
    };

    const handleSchwabLink = async () => {
        setLoading(true);
        setError(null);
        setShowModal(false);
        
        try {
            // Get current session
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error('No active session');
            }

            // Generate random state for security
            const state = Math.random().toString(36).substring(7);
            
            // Store state in localStorage for verification
            localStorage.setItem('schwab_state', state);

            console.log(process.env.REACT_APP_SCHWAB_CLIENT_ID);
            console.log(process.env.REACT_APP_SCHWAB_REDIRECT_URI);
            // Construct Schwab OAuth URL
            const schwabAuthUrl = `https://api.schwabapi.com/v1/oauth/authorize?client_id=${process.env.REACT_APP_SCHWAB_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.REACT_APP_SCHWAB_REDIRECT_URI)}`;


            // Log the URL for debugging
            console.log('Redirecting to:', schwabAuthUrl.toString());

            // Redirect to Schwab login
            window.open(schwabAuthUrl, '_blank');

        } catch (error) {
            console.error('Error initiating account link:', error);
            setError('Failed to initiate account linking. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthCallback = async (code, state) => {
        try {
            console.log('Received callback with code:', code);
            console.log('State:', state);
            
            const response = await fetch('/api/auth/exchange-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code, state })
            });
    
            console.log('Exchange token response status:', response.status);
            const data = await response.json();
            console.log('Exchange token response:', data);
        } catch (error) {
            console.error('Callback error:', error);
        }
    }

    return (
        <div className="profile-preview">
            <div className="card personal-info">
                <h2>Profile</h2>
                <p><strong>Name:</strong> {user?.name || 'N/A'}</p>
                <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
            </div>

            <div className="card linked-accounts">
                <div className="linked-accounts-header">
                    <h2>Linked Brokerage Accounts</h2>
                    <button 
                        className="link-account-btn"
                        onClick={handleLinkAccount}
                        title="Link Brokerage Account"
                    >
                        <span className="plus-icon">+</span> Link Account
                    </button>
                </div>
                
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}
                
                {/* Bank Selection Modal */}
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>Select Your Brokerage</h3>
                                <button 
                                    className="close-modal"
                                    onClick={() => setShowModal(false)}
                                >
                                    ×
                                </button>
                            </div>
                            <div className="modal-body">
                                <button 
                                    className={`bank-option ${loading ? 'loading' : ''}`}
                                    onClick={handleSchwabLink}
                                    disabled={loading}
                                >
                                    <img 
                                        src="https://res.cloudinary.com/dmsgmyybq/image/upload/v1741239025/swb_aqqumw.png" 
                                        alt="Charles Schwab" 
                                        className="bank-logo"
                                    />
                                    <span>Charles Schwab</span>
                                    {loading && <div className="loading-spinner"></div>}
                                </button>
                                {/* Add more bank options here in the future */}
                            </div>
                        </div>
                    </div>
                )}
                
                {linkedAccounts && linkedAccounts.length > 0 ? (
                    <ul className="accounts-list">
                        {linkedAccounts.map((account, index) => (
                            <li key={index} className="account-item">
                                <div className="account-info">
                                    <span className="account-name">{account.name}</span>
                                    <span className="account-number">•••• {account.last4}</span>
                                </div>
                                <span className="account-type">{account.type}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="no-accounts-message">
                        No brokerage accounts linked. Click the button above to connect your first account.
                    </p>
                )}
            </div>
        </div>
    );
}

export default ProfilePreview;