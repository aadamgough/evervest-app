import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageTransition from '../PageTransition';
import Navbar from '../components/Navbar';
import '../App.css';

function Questionnaire() {
    const navigate = useNavigate();

    return (
        <PageTransition>
        <div className="Questionnaire">
            {/* Header and Navbar */}
            <header className="header">
                <Navbar isLoggedIn={true}/>
            </header>

            {/* Main Content */}
            <div className="questionnaire-content">
                <div className="questionnaire-content-inner">
                    <h1>
                        Discover your ideal investment strategy through our custom questionnaires
                    </h1>
                    <p>
                        Our advanced questionnaires leverage sophisticated <strong>machine 
                        learning</strong> to identify the best investment strategies tailored 
                        to your goals.
                    </p>

                    <p>
                    Choose from one of three options to begin 
                    investing in a <strong>sustainable future</strong>—for yourself and for the planet.
                    </p>

                    <div className="questionnaire-buttons-container">
                        <div className="questionnaire-item">
                            <button 
                                className="questionnaire-btn"
                                onClick={() => navigate('/questionnaire/wealth')}
                            >
                                Wealth Management
                            </button>
                        </div>

                        <div className="questionnaire-item">
                            <button 
                                className="questionnaire-btn"
                                onClick={() => navigate('/questionnaire/risk')}
                            >
                                Risk Tolerance
                            </button>
                        </div>

                        <div className="questionnaire-item">
                            <button 
                                className="questionnaire-btn"
                                onClick={() => navigate('/questionnaire/esg')}
                            >
                                ESG Philosophy
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </PageTransition>
    );
}

export default Questionnaire;