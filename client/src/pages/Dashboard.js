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
    const [linkedAccounts, setLinkedAccounts] = useState([]);
    const [nameLoaded, setNameLoaded] = useState(false);
    
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;
                
                if (!session) {
                    navigate('/');
                    return;
                }

                // Fetch user data and linked accounts in parallel
                const [userData, accountsData] = await Promise.all([
                    supabase
                        .from('users')
                        .select('*')
                        .eq('id', session.user.id)
                        .single(),
                    supabase
                        .from('linked_brokerage_accounts')
                        .select(`
                            account_id,
                            account_name,
                            account_type,
                            account_number_last4,
                            provider,
                            metadata
                        `)
                        .eq('user_id', session.user.id)
                ]);

                if (userData.error) throw userData.error;
                
                setUser(userData.data);
                setTimeout(() => setNameLoaded(true), 100);

                if (!accountsData.error) {
                    setLinkedAccounts(accountsData.data);
                }

            } catch (error) {
                console.error('Auth error:', error);
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [navigate]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <PageTransition>
            <div className="Dashboard">
                <header className="header">
                    <Navbar isLoggedIn={true}/>
                </header>

                <div className="dashboard-content">
                    <div className="welcome-section">
                        <h1>
                            Hello, <span className={`user-name ${nameLoaded ? 'visible' : ''}`}>
                                {user ? user.name : 'User'}
                            </span>
                        </h1>
                        <p className="date">{today}</p>
                    </div>

                    <div className="linked-accounts-section">
                        <h2>Investment Accounts</h2>
                        <div className="accounts-grid">
                            {linkedAccounts.map(account => (
                                <div key={account.account_id} className="account-card">
                                    <div className="account-header">
                                        <div className="row">
                                            <img 
                                                src='https://res.cloudinary.com/dmsgmyybq/image/upload/v1742358706/Charles_Schwab_Corporation_logo.svg_kvxw99.png' 
                                                alt="Charles Schwab" 
                                                className="broker-logo"
                                            />
                                            <p className="account-name">{account.provider} Brokerage Account</p>
                                        </div>
                                        <span className="account-type">{account.account_type}</span>
                                    </div>
                                    <div className="account-details">
                                        <p className="account-number">•••• {account.account_number_last4}</p>
                                        {account.metadata?.balances?.current && (
                                            <div className="balance-details">
                                                <div className="balance-item">
                                                    <span>Total Value</span>
                                                    <strong>{formatCurrency(account.metadata.balances.current.equity || 0)}</strong>
                                                </div>
                                                <div className="balance-item">
                                                    <span>Available Funds</span>
                                                    <strong>{formatCurrency(account.metadata.balances.current.availableFunds || 0)}</strong>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {linkedAccounts.length === 0 && (
                                <div className="no-accounts-message">
                                    <p>No accounts linked yet.</p>
                                    <button onClick={() => navigate('/profile')} className="link-account-button">
                                        Link Account
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}

export default Dashboard;