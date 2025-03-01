import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import PageTransition from '../PageTransition';
import Navbar from '../components/Navbar';
import '../App.css';

function InvestmentPlan() {
    const navigate = useNavigate();
    const [selectedOptions, setSelectedOptions] = useState({
        wealthManagement: false,
        riskTolerance: false,
        esgPhilosophy: false
    });
    const [error, setError] = useState('');
    const [user, setUser] = useState();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                
                if (sessionError) throw sessionError;
                
                if (session?.user?.id) {
                    // Get user profile from your users table
                    const { data: userData, error: userError } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (userError) throw userError;
                    
                    setUser(userData);
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

    const toggleOption = (option) => {
        setSelectedOptions(prev => ({
            ...prev,
            [option]: !prev[option]
        }));
    };

    const handleGeneratePlan = async () => {
        try {
            // Get session and validate user
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) throw sessionError;
            if (!session?.user?.id) {
                throw new Error('No user logged in');
            }
    
            // Log session details for debugging
            console.log('Session details:', {
                'User ID': session.user.id,
                'Token present': !!session.access_token,
                'Token': session.access_token // Be careful with this in production
            });
    
            // Get questionnaire responses
            const { data: responses } = await supabase
                .from('questionnaire_responses')
                .select('*')
                .eq('user_id', session.user.id)
                .single();
    
            // Validate questionnaire completion
            const validationErrors = {
                wealthManagement: selectedOptions.wealthManagement && !responses?.wmq_answers,
                riskTolerance: selectedOptions.riskTolerance && !responses?.risktol_answers,
                esgPhilosophy: selectedOptions.esgPhilosophy && !responses?.esg_answers
            };
    
            for (const [type, hasError] of Object.entries(validationErrors)) {
                if (hasError) {
                    setError(`Please complete the ${type.replace(/([A-Z])/g, ' $1').trim()} questionnaire first`);
                    return;
                }
            }
    
            // Prepare request body
            const requestBody = {
                user_id: session.user.id,
                selected_options: selectedOptions,
                plan_details: {
                    ...(selectedOptions.wealthManagement && { wmq_answers: responses.wmq_answers }),
                    ...(selectedOptions.riskTolerance && { risktol_answers: responses.risktol_answers }),
                    ...(selectedOptions.esgPhilosophy && { esg_answers: responses.esg_answers })
                }
            };
    
            // Log request details
            console.log('Sending request with:', {
                endpoint: 'http://localhost:5002/api/generate-plan',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer [token-hidden]'
                },
                body: requestBody
            });
    
            // Send request
            const response = await fetch('http://localhost:5002/api/generate-plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify(requestBody)
            });
    
            // Handle response
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Server response error:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorData
                });
                throw new Error(errorData.error || 'Failed to generate investment plan');
            }
    
            const data = await response.json();
            console.log('Successfully generated plan:', data);
    
            // Navigate to investments page
            navigate('/investments');
    
        } catch (error) {
            console.error('Error in handleGeneratePlan:', {
                message: error.message,
                stack: error.stack
            });
            setError('Failed to generate investment plan. Please try again.');
        }
    };

    return (
        <PageTransition>
            <div className="InvestmentPlan">
                <Navbar isLoggedIn={true}/>
                <div className="questionnaire-content">
                    <div className="questionnaire-content-inner">
                        <h1>Investment Plan Generation for  {user ? user.name : 'User'} </h1>
                        <h2>What would you like to incorporate in your investment plan?</h2>
                        <p>Choose the data housed in your profile and let Evervest craft a customized investment strategy.</p>

                        <div className="investment-buttons-container">
                        {error && <div className="error-message" style={{color: 'red'}}>{error}</div>}
                            <div className="investment-item">
                                <button 
                                    className={`investment-btn ${selectedOptions.wealthManagement ? 'selected' : ''}`}
                                    onClick={() => toggleOption('wealthManagement')}
                                >
                                    {selectedOptions.wealthManagement ? '✓ ' : ''}Wealth Management
                                </button>
                            </div>

                            <div className="investment-item">
                                <button 
                                    className={`investment-btn ${selectedOptions.riskTolerance ? 'selected' : ''}`}
                                    onClick={() => toggleOption('riskTolerance')}
                                >
                                    {selectedOptions.riskTolerance ? '✓ ' : ''}Risk Tolerance
                                </button>
                            </div>

                            <div className="investment-item">
                                <button 
                                    className={`investment-btn ${selectedOptions.esgPhilosophy ? 'selected' : ''}`}
                                    onClick={() => toggleOption('esgPhilosophy')}
                                >
                                    {selectedOptions.esgPhilosophy ? '✓ ' : ''}ESG Philosophy
                                </button>
                            </div>

                            <div className="investment-item">
                                <button 
                                    className="generate-btn"
                                    onClick={handleGeneratePlan}
                                >
                                    Generate Investment Plan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}

export default InvestmentPlan;