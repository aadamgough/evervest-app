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
        // Check if at least one option is selected
        if (!Object.values(selectedOptions).some(value => value)) {
            setError('Please select at least one option');
            return;
        }

        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError) throw sessionError;
            if (!session?.user?.id) {
                throw new Error('No user logged in');
            }

            // Get questionnaire responses based on selected options
            const { data: responses } = await supabase
                .from('questionnaire_responses')
                .select('*')
                .eq('user_id', session.user.id)
                .single();

            // Validate that selected questionnaires are completed
            if (selectedOptions.wealthManagement && !responses?.wmq_answers) {
                setError('Please complete the Wealth Management questionnaire first');
                return;
            }
            if (selectedOptions.riskTolerance && !responses?.risktol_answers) {
                setError('Please complete the Risk Tolerance questionnaire first');
                return;
            }
            if (selectedOptions.esgPhilosophy && !responses?.esg_answers) {
                setError('Please complete the ESG Philosophy questionnaire first');
                return;
            }

            
            console.log('abt to send REQUEST');

            const response = await fetch('http://localhost:5001/api/generate-plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: session.user.id,
                    selectedOptions: selectedOptions,  // Pass the selected options
                    questionnaire_responses: {
                        // Only include selected questionnaire responses
                        ...(selectedOptions.wealthManagement && { wmq_answers: responses.wmq_answers }),
                        ...(selectedOptions.riskTolerance && { risktol_answers: responses.risktol_answers }),
                        ...(selectedOptions.esgPhilosophy && { esg_answers: responses.esg_answers })
                    }
                })
            });

            console.log('Raw response received:', response);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to generate plan');
            }

    

            const data = await response.json();
            console.log('Generated plan:', data);

            // Navigate to investments page
            navigate('/investments');

        } catch (error) {
            console.error('Error generating plan:', error);
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