import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import PageTransition from '../PageTransition';
import Navbar from '../components/Navbar';
import '../App.css';

function ResponseDetail() {
    const navigate = useNavigate();
    const [responses, setResponses] = useState(null);
    const [originalResponses, setOriginalResponses] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                    .select('wmq_answers')
                    .eq('user_id', session.user.id)
                    .single();

                if (error) throw error;
                setResponses(data.wmq_answers);
                setOriginalResponses(JSON.stringify(data.wmq_answers));

            } catch (err) {
                console.error('Error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchResponses();
    }, [navigate]);

    // Check for changes whenever responses are updated
    useEffect(() => {
        if (responses && originalResponses) {
            const hasChanged = JSON.stringify(responses) !== originalResponses;
            setHasChanges(hasChanged);
        }
    }, [responses, originalResponses]);

    const handleAnswerUpdate = (question, newAnswer) => {
        const updatedResponses = { ...responses, [question]: newAnswer };
        setResponses(updatedResponses);
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            const { data: { session } } = await supabase.auth.getSession();
            
            const { error } = await supabase
                .from('questionnaire_responses')
                .update({ wmq_answers: responses })
                .eq('user_id', session.user.id);

            if (error) throw error;
            
            // Update original responses to match current responses
            setOriginalResponses(JSON.stringify(responses));
            setHasChanges(false);
            
            // Show success message
            alert('Responses updated successfully!');

        } catch (err) {
            console.error('Error updating answers:', err);
            setError('Failed to update answers');
            alert('Failed to update responses. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <PageTransition>
            <div className="ResponseDetail">
                <Navbar isLoggedIn={true} />
                <div className="detail-header">
                    <button className="back-button" onClick={() => navigate('/investments')}>
                        ← Responses
                    </button>
                </div>
                <div className="detail-content">
                    <div className="detail-header-with-submit">
                        <h1>Investment Profile Questionnaire</h1>
                        <button 
                            className={`submit-button ${hasChanges ? 'active' : ''} ${isSubmitting ? 'submitting' : ''}`}
                            onClick={handleSubmit}
                            disabled={!hasChanges || isSubmitting}
                        >
                            {isSubmitting ? 'Updating...' : 'Submit Changes'}
                        </button>
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