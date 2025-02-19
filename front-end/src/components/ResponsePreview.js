import React from 'react';
import wealthIcon from '../logos/mountain.jpg';  // You'll need to add these images
import riskIcon from '../logos/bridge.jpg';
import esgIcon from '../logos/monkey.jpg';
import '../App.css';

function ResponsePreview({ title, data, completed }) {
    const getPreviewImage = () => {
        switch(title) {
            case 'Wealth Management':
                return wealthIcon;
            case 'Risk Tolerance':
                return riskIcon;
            case 'ESG Philosophy':
                return esgIcon;
            default:
                return null;
        }
    };

    const getPreviewDescription = () => {
        switch(title) {
            case 'Wealth Management':
                return 'Your wealth management preferences and financial goals.';
            case 'Risk Tolerance':
                return 'Your risk tolerance profile and investment comfort level.';
            case 'ESG Philosophy':
                return 'Your environmental, social, and governance investment priorities.';
            default:
                return '';
        }
    };

    return (
        <div className="response-card">
            <div className="card-image-container">
                <img 
                    src={getPreviewImage()} 
                    alt={title} 
                    className="card-image"
                />
                <div className="completion-badge">
                    {completed ? 'Completed' : 'Not Started'}
                </div>
            </div>
            <div className="card-content">
                <h3 className="card-title">{title}</h3>
                <p className="card-description">{getPreviewDescription()}</p>
            </div>
        </div>
    );
}

export default ResponsePreview;