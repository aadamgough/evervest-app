import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PageTransition from '../PageTransition';
import { supabase } from '../lib/supabaseClient';


function Investments() {
    const { type } = useParams();
    const navigate = useNavigate();
    const [plan, setPlan] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvestmentPlan = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    navigate('/');
                    return;
                }

                const { data, error } = await supabase
                    .from('investment_plans')
                    .select(type)
                    .eq('user_id', session.user.id)
                    .single();

                if (error) throw error;
                setPlan(data[type]);

            } catch (err) {
                console.error('Error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchInvestmentPlan();
    }, [type, navigate]);


    return (
        <PageTransition>
            <div className="Investments">
                <Navbar isLoggedIn={true} />
                <div className="content">
                    <h1>Investments</h1>
                    {plan}
                </div>
            </div>
        </PageTransition>
    );
}

export default Investments;