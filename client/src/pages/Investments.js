import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PageTransition from '../PageTransition';
import { supabase } from '../lib/supabaseClient';

function Investments() {
    const navigate = useNavigate();
    const [plan, setPlan] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [hasCompletedQuestionnaire, setHasCompletedQuestionnaire] = useState(false);
    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError) throw sessionError;

                if (!session) {
                    navigate('/');
                    return;
                }

                // Fetch user data, questionnaire status, and investment plan in parallel
                const [userResponse, questionnaireResponse, planResponse] = await Promise.all([
                    supabase
                        .from('users')
                        .select('*')
                        .eq('id', session.user.id)
                        .single(),
                    supabase
                        .from('questionnaire_responses')
                        .select('wmq_answers')
                        .eq('user_id', session.user.id)
                        .single(),
                    supabase
                        .from('investment_plans')
                        .select('plan_details, created_at')
                        .eq('user_id', session.user.id)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .single()
                ]);

                if (userResponse.error) throw userResponse.error;
                setUser(userResponse.data);
                setHasCompletedQuestionnaire(!!questionnaireResponse.data?.wmq_answers);
                
                if (!planResponse.error) {
                    setPlan(planResponse.data.plan_details.generated_plan);
                }

            } catch (err) {
                console.error('Error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const handleGeneratePlan = async () => {
        try {
            setIsGeneratingPlan(true);
            const { data: { session } } = await supabase.auth.getSession();
            
            const { data: responses } = await supabase
                .from('questionnaire_responses')
                .select('wmq_answers')
                .eq('user_id', session.user.id)
                .single();

            const requestBody = {
                user_id: session.user.id,
                plan_details: {
                    wmq_answers: responses.wmq_answers
                }
            };

            const response = await fetch('/api/investments/generate-plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate investment plan');
            }

            const data = await response.json();
            window.location.reload(); // Refresh to show new plan

        } catch (error) {
            console.error('Error in handleGeneratePlan:', error);
            setError('Failed to generate investment plan. Please try again.');
        } finally {
            setIsGeneratingPlan(false);
        }
    };

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

    if (loading) return <div className="loading-spinner">Loading...</div>;

    return (
        <PageTransition>
            <div className="investments-page">
                <Navbar isLoggedIn={true} />
                <div className="investments-content">
                    <h1>Investment Management</h1>
                    
                    <div className="action-cards">
                        {/* Questionnaire Card */}
                        <div className="action-card questionnaire-card">
                            <h2>Investment Profile Questionnaire</h2>
                            <p>
                                Discover your ideal investment strategy through our advanced questionnaire
                                powered by machine learning.
                            </p>
                            <button 
                                className="action-button"
                                onClick={() => navigate('/questionnaire/wealth')}
                            >
                                {hasCompletedQuestionnaire ? 'Retake Questionnaire' : 'Start Questionnaire'}
                            </button>
                        </div>

                        {/* Generate Plan Card */}
                        <div className="action-card generate-plan-card">
                            <h2>Generate Investment Plan</h2>
                            <p>
                                Create a personalized investment strategy based on your questionnaire responses.
                            </p>
                            <button 
                                className="action-button"
                                onClick={handleGeneratePlan}
                                disabled={!hasCompletedQuestionnaire || isGeneratingPlan}
                            >
                                {isGeneratingPlan ? 'Generating...' : 'Generate Plan'}
                            </button>
                            {!hasCompletedQuestionnaire && (
                                <p className="warning-text">Please complete the questionnaire first</p>
                            )}
                        </div>
                    </div>

                    {/* Investment Plan Display */}
                    <div className="plan-container">
                        <h2>Your Investment Plan</h2>
                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}
                        {plan ? (
                            <div className="plan-card">
                                {formatPlanContent(plan)}
                            </div>
                        ) : (
                            <div className="no-plan-message">
                                No investment plan generated yet. Complete the questionnaire and generate your plan to get started.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}

export default Investments;