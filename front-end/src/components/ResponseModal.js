import React, { useState } from 'react';
import '../App.css';

function ResponseModal({ type, data, onClose, onUpdate }) {
    const [answers, setAnswers] = useState(data || {});

    const handleAnswerChange = (question, newAnswer) => {
        const updatedAnswers = {
            ...answers,
            [question]: newAnswer
        };
        setAnswers(updatedAnswers);
        onUpdate(updatedAnswers);
    };

    const getModalTitle = () => {
        switch(type) {
            case 'wmq_answers':
                return 'Wealth Management Questionnaire';
            case 'risktol_answers':
                return 'Risk Tolerance Assessment';
            case 'esg_answers':
                return 'ESG Philosophy Survey';
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{getModalTitle()}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                
                <div className="modal-body">
                    {Object.entries(answers).map(([question, answer]) => (
                        <div key={question} className="response-edit-item">
                            <p className="question">{question}</p>
                            <input
                                type="text"
                                value={answer || ''}
                                onChange={(e) => handleAnswerChange(question, e.target.value)}
                                className="response-edit-input"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ResponseModal;