import React from 'react';
import '../styles/ProfilePreview.css';

function ProfilePreview({ user, linkedAccounts, onLinkAccount }) {
    const handleLinkAccount = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            
            const response = await fetch('/api/auth/exchange-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    code: authorizationCode,
                    state: session.user.id
                })
            });
    
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            
            // Handle successful account linking
            // Update UI, show success message, etc.
        } catch (error) {
            console.error('Error linking account:', error);
        }
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