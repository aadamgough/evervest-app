import React from 'react';
import '../styles/ProfilePreview.css';

function ProfilePreview({ user, linkedAccounts, onLinkAccount }) {
    const handleLinkAccount = () => {
        // This will be replaced with actual OAuth flow
        const schwabAuthUrl = "https://api.schwabapi.com/v1/oauth/authorize?response_type=code&client_id=1wzwOrhivb2PkR1UCAUVTKYqC4MTNYlj&scope=readonly&redirect_uri=https://developer.schwab.com/oauth2-redirect.html";
        const clientId = process.env.REACT_APP_SCHWAB_CLIENT_ID;
        const redirectUri = encodeURIComponent(process.env.REACT_APP_REDIRECT_URI || "http://localhost:3000/auth/callback");
        const scope = encodeURIComponent("accounts transactions");
        
        const authorizationUrl = `${schwabAuthUrl}?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scope}&state=${user.id}`;
        
        // Open OAuth window
        window.open(authorizationUrl, "_blank", "width=800,height=600");
    };

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
                    <p className="no-accounts-message">No brokerage accounts linked. Click the button above to connect your first account.</p>
                )}
            </div>
        </div>
    );
}

export default ProfilePreview;