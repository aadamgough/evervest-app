import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function AuthCallback() {
    const [status, setStatus] = useState('Processing...');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                console.log('AuthCallback component mounted');
                console.log('Current URL:', window.location.href);
                
                // Get the authorization code from URL
                const params = new URLSearchParams(location.search);
                const code = params.get('code');
                const state = params.get('state');
                
                if (!code) {
                    throw new Error('No authorization code received');
                }

                console.log('Received code:', code);
                console.log('Received state:', state);
                
                // Exchange code for tokens (this should be done server-side)
                const response = await fetch('/api/auth/exchange-token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ code, state }),
                });
                
                if (!response.ok) {
                    throw new Error('Failed to exchange authorization code');
                }
                
                setStatus('Account successfully linked!');
                
                // Redirect back to profile page after a delay
                setTimeout(() => {
                    navigate('/profile');
                }, 2000);
                
            } catch (error) {
                console.error('Auth callback error:', error);
                setStatus(`Error: ${error.message}`);
            }
        };
        
        handleCallback();
    }, [location, navigate]);
    
    return (
        <div className="auth-callback">
            <h2>Linking Your Account</h2>
            <p>{status}</p>
        </div>
    );
}

export default AuthCallback;