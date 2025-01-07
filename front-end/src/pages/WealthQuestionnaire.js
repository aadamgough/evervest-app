import React from 'react';
import QuestionnaireLayout from '../components/QuestionnaireLayout';

const wealthQuestions = [
  {
    question: "What is your primary financial goal?",
    type: "radio",
    options: [
      { value: "retirement", label: "Retirement Planning" },
      { value: "wealth", label: "Wealth Accumulation" },
      { value: "income", label: "Income Generation" },
      { value: "preservation", label: "Wealth Preservation" }
    ]
  },
  {
    question: "What is your current annual income?",
    type: "radio",
    options: [
      { value: "0-50k", label: "Under $50,000" },
      { value: "50k-100k", label: "$50,000 - $100,000" },
      { value: "100k-250k", label: "$100,000 - $250,000" },
      { value: "250k+", label: "Over $250,000" }
    ]
  },
  // Add more questions...
];

const WealthQuestionnaire = () => {
  const handleComplete = (answers) => {
    console.log('Wealth Management answers:', answers);
    // Handle submission logic here
  };

  return (
    <QuestionnaireLayout
      questions={wealthQuestions}
      onComplete={handleComplete}
      title="Wealth Management Questionnaire"
    />
  );
};

export default WealthQuestionnaire;