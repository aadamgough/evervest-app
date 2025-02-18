import React from 'react';

function ResponsePreview({ title, data, completed }) {
    // Debug log to see what data we're receiving
    console.log(`${title} data:`, data);

    // Check if data exists and is not null
    const isCompleted = data !== null && data !== undefined;

    const getPreviewContent = () => {
        if (!isCompleted) return [];
        try {
            // Parse the data if it's a string
            const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
            return Object.entries(parsedData).slice(0, 3);
        } catch (error) {
            console.error('Error parsing data:', error);
            return [];
        }
    };

    return (
        <div className="response-preview">
            <div className="preview-header">
                <h3>{title}</h3>
                <span className={`status-badge ${isCompleted ? 'completed' : 'incomplete'}`}>
                    {isCompleted ? 'Completed' : 'Not Started'}
                </span>
            </div>
            
            {isCompleted && (
                <div className="preview-content">
                    <div className="preview-window">
                        {getPreviewContent().map(([_, answer], index) => (  // Use _ to ignore the index key
                            <div key={index} className="preview-answer">
                                <span className="answer-dot"></span>
                                <div className="answer-content">
                                    <p className="answer-text">{answer}</p>
                                </div>
                            </div>
                        ))}
                        <div className="preview-fade"></div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ResponsePreview;