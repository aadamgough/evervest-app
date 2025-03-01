import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import PageTransition from '../PageTransition';
import Navbar from '../components/Navbar';
import '../App.css';

function ResponseDetail() {
    const { type } = useParams();
    const navigate = useNavigate();
    const [responses, setResponses] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getQuestionnaireTitle = () => {
        switch(type) {
            case 'wmq_answers':
                return 'Wealth Management Questionnaire';
            case 'risktol_answers':
                return 'Risk Tolerance Assessment';
            case 'esg_answers':
                return 'ESG Philosophy Survey';
            default:
                return 'Questionnaire Responses';
        }
    };

    useEffect(() => {
        const fetchResponses = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    navigate('/');
                    return;
                }

                const { data, error } = await supabase
                    .from('questionnaire_responses')
                    .select(type)
                    .eq('user_id', session.user.id)
                    .single();

                if (error) throw error;
                setResponses(data[type]);

            } catch (err) {
                console.error('Error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchResponses();
    }, [type, navigate]);

    const handleAnswerUpdate = async (question, newAnswer) => { //HAVEN'T CHECKED IF THIS WORKS
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const updatedResponses = { ...responses, [question]: newAnswer };

            const { error } = await supabase
                .from('questionnaire_responses')
                .update({ [type]: updatedResponses })
                .eq('user_id', session.user.id);

            if (error) throw error;
            setResponses(updatedResponses);

        } catch (err) {
            console.error('Error updating answer:', err);
            setError('Failed to update answer');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <PageTransition>
            <div className="ResponseDetail">
                <Navbar isLoggedIn={true} />
                <div className="detail-header">
                        <button className="back-button" onClick={() => navigate('/responses')}>
                            ← Responses
                        </button>
                    </div>
                <div className="detail-content">
                    <div className="detail-header">
                        <h1>{getQuestionnaireTitle()}</h1>
                    </div>

                    <div className="answers-container">
                        {responses && Object.entries(responses).map(([question, answer]) => (
                            <div key={question} className="answer-item">
                                <h3>{question}</h3>
                                <div className="answer-edit">
                                    <input
                                        type="text"
                                        value={answer}
                                        onChange={(e) => handleAnswerUpdate(question, e.target.value)}
                                        className="answer-input"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}

export default ResponseDetail;