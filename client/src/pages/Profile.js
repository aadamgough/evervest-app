import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import PageTransition from '../PageTransition';
import Navbar from '../components/Navbar';
import ProfilePreview from '../components/ProfilePreview';
import '../App.css';

function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [linkedAccounts, setLinkedAccounts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError) throw sessionError;

                if (!session) {
                    navigate('/');
                    return;
                }

                // Fetch user data
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('name, email')
                    .eq('id', session.user.id)
                    .single();

                if (userError) throw userError;
                setUser(userData);

                // Fetch linked brokerage accounts with more details
                const { data: accountsData, error: accountsError } = await supabase
                    .from('linked_brokerage_accounts')
                    .select(`
                        account_id,
                        account_name,
                        account_type,
                        account_number_last4,
                        provider,
                        metadata
                    `)
                    .eq('user_id', session.user.id);

                if (accountsError) throw accountsError;

                // Transform the accounts data to include relevant details
                const formattedAccounts = accountsData.map(account => ({
                    id: account.account_id,
                    name: account.account_provider + "Brokerage Account",
                    type: account.account_type,
                    last4: account.account_number_last4,
                    provider: account.provider,
                    balances: account.metadata?.balances?.current || {},
                    positions: account.metadata?.positions || []
                }));

                setLinkedAccounts(formattedAccounts);

            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [navigate]);


    if (loading) return <div>Loading...</div>;

    return (
        <PageTransition>
            <div className="Responses">
                <Navbar isLoggedIn={true} />
                <div className="dashboard-content">
                    <div className="action-buttons-container">
                        <ProfilePreview 
                            user={user} 
                            linkedAccounts={linkedAccounts} 
                        />
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}

export default Profile;