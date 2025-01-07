import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageTransition from '../PageTransition';
import { IoArrowBack } from 'react-icons/io5'; // Install with: npm install react-icons
import '../App.css';

function Questionnaire() {
    const navigate = useNavigate();

    return (
        <PageTransition>
        <div className="Questionnaire">
            {/* Header and Navbar */}
            <header className="header">
                <div className="navbar w-nav">
                <div className="nav-container w-container">
                    <Link to="/" className="logo w-nav-brand w--current">
                    <div className="name-text">
                        <h1>Evervest</h1>
                    </div>
                    </Link>
                    <nav role="navigation" className="nav-menu w-nav-menu">
                    <div className="nav-links" style={{ marginRight: 'auto' }}>
                        <div className="dropdown">
                        <Link to="/dashboard" className="nav-text-link">Home</Link>
                        </div>
                        <div className="dropdown">
                        <Link to="/solutions" className="nav-text-link">Investments</Link>
                        <div className="dropdown-content">
                            <Link to="/solution1">Portfolio 1</Link>
                            <Link to="/solution2">Portfolio 2</Link>
                        </div>
                        </div>
                        <div className="dropdown">
                        <Link to="/resources" className="nav-text-link">Profile</Link>
                        </div>
                        <Link to="/questionnaire" className="nav-text-link">Questionnaires</Link>
                    </div>
                    <div className="nav-actions" style={{ marginLeft: 'auto' }}>
                        <Link to="/contact-sales" className="nav-action-link">Contact Support</Link>
                        <Link to="/signup" className="signup-button">Logout</Link>
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
                    </button>
                </div>
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