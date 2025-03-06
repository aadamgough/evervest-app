import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import '../styles/ProfilePreview.css';

function ProfilePreview({ user, linkedAccounts, onLinkAccount }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

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

            // Construct Schwab OAuth URL
            const schwabAuthUrl = new URL(process.env.REACT_APP_SCHWAB_AUTH_URL);
            schwabAuthUrl.searchParams.append('client_id', process.env.REACT_APP_SCHWAB_CLIENT_ID);
            schwabAuthUrl.searchParams.append('response_type', 'code');
            schwabAuthUrl.searchParams.append('redirect_uri', process.env.REACT_APP_REDIRECT_URI);
            schwabAuthUrl.searchParams.append('state', state);
            schwabAuthUrl.searchParams.append('scope', 'openid profile accounts holdings');

            // Log the URL for debugging
            console.log('Redirecting to:', schwabAuthUrl.toString());

            // Redirect to Schwab login
            window.location.href = schwabAuthUrl.toString();

        } catch (error) {
            console.error('Error initiating account link:', error);
            setError('Failed to initiate account linking. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ... rest of your existing code (handleOAuthCallback, etc.) ...

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