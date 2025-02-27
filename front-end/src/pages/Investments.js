import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PageTransition from '../PageTransition';
import { supabase } from '../lib/supabaseClient';

function Investments() {
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
                    .select('plan_details, created_at')
                    .eq('user_id', session.user.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (error) throw error;
                console.log(data.plan_details.generated_plan);
                setPlan(data.plan_details.generated_plan);

            } catch (err) {
                console.error('Error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchInvestmentPlan();
    }, [navigate]);

    const formatPlanContent = (planContent) => {
    // Split the content into sections based on newlines
    const sections = planContent.split(/\n\s*\n/); // Split on one or more newlines

    return sections.map((section, index) => {
        if (section.trim().length === 0) return null; // Skip empty sections
        
        // Fix this
        const isHeader = section.toUpperCase() === section || section.includes(':');

        console.log("this is the section",section);
        
        return (
            <div key={index} className="plan-header">
                {section}
            </div>
        );
    });
};

    return (
        <PageTransition>
            <div className="investments-page">
                <Navbar isLoggedIn={true} />
                <div className="investments-content">
                    <h1>Your Investment Plan</h1>
                    
                    {loading && (
                        <div className="loading-spinner">
                            Loading your investment plan...
                        </div>
                    )}
                    
                    {error && (
                        <div className="error-message">
                            Error loading investment plan: {error}
                        </div>
                    )}
                    
                    {plan && (
                        <div className="investment-plan-container">
                            <div className="plan-card">
                                {formatPlanContent(plan)}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
}

export default Investments;