import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import PageTransition from '../PageTransition';
import Navbar from '../components/Navbar';
import ResponsePreview from '../components/ResponsePreview';
import '../App.css';

function Responses() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [responses, setResponses] = useState({
        wmq_answers: null,
        risktol_answers: null,
        esg_answers: null
    });

    useEffect(() => {
        const fetchUserAndResponses = async () => {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError) throw sessionError;

                if (!session) {
                    navigate('/');
                    return;
                }

                // First fetch user data for the name
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('name')
                    .eq('id', session.user.id)
                    .single();

                if (userError) throw userError;
                setUser(userData);

                // Then fetch questionnaire responses
                const { data: responseData, error: responseError } = await supabase
                    .from('questionnaire_responses')
                    .select('wmq_answers, risktol_answers, esg_answers')
                    .eq('user_id', session.user.id)
                    .single();

                if (responseError) throw responseError;
                setResponses(responseData);

            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserAndResponses();
    }, [navigate]);

    const handleResponseClick = (type) => {
        navigate(`/responses/${type}`);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <PageTransition>
            <div className="Responses">
                <Navbar isLoggedIn={true} />
                
                <div className="dashboard-content">
                    <div className="welcome-section">
                        <h1>Questionnaire Responses for {user?.name}</h1>
                        <p className="subtitle">Review and manage your investment profile responses</p>
                    </div>

                    <div className="action-buttons-container">
                        <div onClick={() => handleResponseClick('wmq_answers')}>
                            <ResponsePreview 
                                title="Wealth Management"
                                data={responses.wmq_answers}
                                completed={responses.wmq_answers !== null}
                            />
                        </div>

                        <div onClick={() => handleResponseClick('risktol_answers')}>
                            <ResponsePreview 
                                title="Risk Tolerance"
                                data={responses.risktol_answers}
                                completed={responses.risktol_answers !== null}
                            />
                        </div>

                        <div onClick={() => handleResponseClick('esg_answers')}>
                            <ResponsePreview 
                                title="ESG Philosophy"
                                data={responses.esg_answers}
                                completed={responses.esg_answers !== null}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}

export default Responses;