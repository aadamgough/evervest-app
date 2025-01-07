import React from 'react';
import '../styles/Question.css';

const Question = ({ 
  question, 
  type, 
  options, 
  value, 
  onChange, 
  required = true 
}) => {
  const renderInput = () => {
    switch (type) {
      case 'radio':
        return (
          <div className="radio-group">
            {options.map((option) => (
              <label key={option.value} className="radio-option">
                <input
                  type="radio"
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(e.target.value)}
                  required={required}
                />
                {option.label}
              </label>
            ))}
          </div>
        );

      case 'slider':
        return (
          <input
            type="range"
            min={options.min}
            max={options.max}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            className="slider-input"
          />
        );

      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            className="text-input"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="question-container">
      <h2 className="question-text">{question}</h2>
      {renderInput()}
    </div>
  );
};

export default Question;