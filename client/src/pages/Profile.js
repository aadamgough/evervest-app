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
    const [linkedAccounts, setLinkedAccounts] = useState([]); // State for linked bank accounts
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

                // Fetch user data for the name and email
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('name, email') // Fetch email as well
                    .eq('id', session.user.id)
                    .single();

                if (userError) throw userError;
                setUser(userData);

                // Fetch linked bank accounts (assuming you have a table for this)
                const { data: accountsData, error: accountsError } = await supabase
                    .from('linked_accounts') // Replace with your actual table name
                    .select('account_name') // Adjust the field as necessary
                    .eq('user_id', session.user.id);

                if (accountsError) throw accountsError;
                setLinkedAccounts(accountsData.map(account => account.account_name)); // Adjust based on your data structure

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
                        <ProfilePreview user={user} linkedAccounts={linkedAccounts} />
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}

export default Profile;