import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Question from './Question';
import '../styles/QuestionnaireLayout.css';

const QuestionnaireLayout = ({ questions, onComplete, title }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  const handleAnswer = (value) => {
    setAnswers({
      ...answers,
      [currentQuestion]: value
    });
  };

  const handleNext = () => {
    if (currentQuestion === questions.length - 1) {
      onComplete(answers);
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentQuestion(currentQuestion - 1);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="questionnaire-layout">
      <h1>{title}</h1>
      
      {/* Progress bar */}
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Question */}
      <Question
        {...questions[currentQuestion]}
        value={answers[currentQuestion] || ''}
        onChange={handleAnswer}
      />

      {/* Navigation buttons */}
      <div className="navigation-buttons">
        {currentQuestion > 0 && (
          <button 
            onClick={handlePrevious}
            className="nav-button prev"
          >
            Previous
          </button>
        )}
        <button 
          onClick={handleNext}
          className="nav-button next"
          disabled={!answers[currentQuestion]}
        >
          {currentQuestion === questions.length - 1 ? 'Submit' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default QuestionnaireLayout;