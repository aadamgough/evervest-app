import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import PageTransition from '../PageTransition';
import Navbar from '../components/Navbar';
import '../App.css';

function InvestmentPlan() {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [user, setUser] = useState();
    const [hasCompletedQuestionnaire, setHasCompletedQuestionnaire] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                
                if (sessionError) throw sessionError;
                
                if (session?.user?.id) {
                    // Get user profile and questionnaire responses
                    const [userResponse, questionnaireResponse] = await Promise.all([
                        supabase
                            .from('users')
                            .select('*')
                            .eq('id', session.user.id)
                            .single(),
                        supabase
                            .from('questionnaire_responses')
                            .select('wmq_answers')
                            .eq('user_id', session.user.id)
                            .single()
                    ]);

                    if (userResponse.error) throw userResponse.error;
                    setUser(userResponse.data);

                    // Check if questionnaire is completed
                    setHasCompletedQuestionnaire(!!questionnaireResponse.data?.wmq_answers);
                    
                } else {
                    navigate('/');
                }
            } catch (error) {
                console.error('Error fetching user:', error);
                setError('Failed to load user data');
            }
        };

        fetchUser();
    }, [navigate]);

    const handleGeneratePlan = async () => {
        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) throw sessionError;
            if (!session?.user?.id) {
                throw new Error('No user logged in');
            }

            // Get questionnaire responses
            const { data: responses, error: responseError } = await supabase
                .from('questionnaire_responses')
                .select('wmq_answers')
                .eq('user_id', session.user.id)
                .single();

            if (responseError) throw responseError;

            if (!responses?.wmq_answers) {
                setError('Please complete the wealth management questionnaire first');
                return;
            }

            // Prepare request body
            const requestBody = {
                user_id: session.user.id,
                plan_details: {
                    wmq_answers: responses.wmq_answers
                }
            };

            console.log('Request body:', requestBody);

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
            console.log('Successfully generated plan:', data);
            navigate('/investments');

        } catch (error) {
            console.error('Error in handleGeneratePlan:', error);
            setError('Failed to generate investment plan. Please try again.');
        }
    };

    return (
        <PageTransition>
            <div className="InvestmentPlan">
                <Navbar isLoggedIn={true}/>
                <div className="questionnaire-content">
                    <div className="questionnaire-content-inner">
                        <h1>Investment Plan Generation for {user ? user.name : 'User'}</h1>
                        <h2>Ready to create your personalized investment strategy?</h2>
                        <p>Let's use your wealth management profile to craft a customized investment plan.</p>

                        <div className="investment-buttons-container">
                            {error && <div className="error-message" style={{color: 'red'}}>{error}</div>}
                            
                            {!hasCompletedQuestionnaire ? (
                                <div className="investment-item">
                                    <button 
                                        className="questionnaire-btn"
                                        onClick={() => navigate('/questionnaire')}
                                    >
                                        Complete Questionnaire
                                    </button>
                                </div>
                            ) : (
                                <div className="investment-item">
                                    <button 
                                        className="questionnaire-btn"
                                        onClick={() => navigate('/questionnaire')}
                                    >
                                        Retake Questionnaire
                                    </button>
                                    <button 
                                        className="generate-btn"
                                        onClick={handleGeneratePlan}
                                    >
                                        Generate Investment Plan
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

export default InvestmentPlan;