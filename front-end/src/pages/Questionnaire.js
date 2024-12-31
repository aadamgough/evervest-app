import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5'; // Install with: npm install react-icons
import '../App.css';

function Questionnaire() {
    const navigate = useNavigate();

    return (
        <div className="Questionnaire">
            {/* Header and Navbar */}
            <header className="header">
                <div className="navbar w-nav">
                    <div className="nav-container w-container">
                        <Link to="/" className="logo w-nav-brand w--current">
                            <div className="name-text">
                                <h1>Evervest FP</h1>
                            </div>
                        </Link>
                        <nav role="navigation" className="nav-menu w-nav-menu">
                            <div className="nav-div-left">
                                <Link to="/dashboard" className="nav-text-link">Dashboard</Link>
                                <Link to="/investments" className="nav-text-link">My Investments</Link>
                                <Link to="/profile" className="nav-text-link">Profile</Link>
                            </div>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="questionnaire-content">
                {/* Back Button */}
                <div className="back-button-container">
                    <button 
                        onClick={() => navigate('/dashboard')} 
                        className="back-button"
                    >
                        <IoArrowBack /> Back to Dashboard
                    </button>
                </div>
                <div className="questionnaire-content-inner">
                    <h1 style={{fontFamily: 'Madeinfinity-regular'}}>
                        Questionnaires
                    </h1>

                    <h2>
                        Our advanced questionnaires leverage sophisticated machine 
                        learning to identify the best investment strategies tailored 
                        to your goals. Choose from one of three options to begin 
                        investing in a sustainable future—for yourself and for the planet.
                    </h2>

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
    );
}

export default Questionnaire;