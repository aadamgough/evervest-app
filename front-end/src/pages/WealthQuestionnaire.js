import React from 'react';
import QuestionnaireLayout from '../components/QuestionnaireLayout';
import PageTransition from '../PageTransition';
import { Link } from 'react-router-dom';

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
    {
      question: "Please select one of the following:",
      type: "radio",
      options: [
        {
          value: "qualified_purchaser",
          label: "I am a qualified purchaser as defined by at least $5+ million of investable assets"
        },
        {
          value: "qualified_client",
          label: "I am a qualified client as defined by at least $2.2M of net worth, not including my primary residence"
        },
        {
          value: "accredited_investor_1m",
          label: "I am an accredited investor as defined by at least $1M of net worth, not including my primary residence"
        },
        {
          value: "accredited_investor_income",
          label: "I am an accredited investor as defined by income over $200,000 if single, or $300,000 if married"
        },
        {
          value: "below_accredited",
          label: "My current annual income is below $200,000 or I am married and our joint income is below $300,000 combined"
        }
      ]
    },
    {
      question: "When it comes to investing in stocks, bonds, or mutual funds, I would describe myself as ...",
      type: "radio",
      options: [
        { value: "very_inexperienced", label: "Very Inexperienced" },
        { value: "somewhat_inexperienced", label: "Somewhat Inexperienced" },
        { value: "somewhat_experienced", label: "Somewhat Experienced" },
        { value: "experienced", label: "Experienced" },
        { value: "very_experienced", label: "Very Experienced" }
      ]
    },
    {
      question: "How would you describe your investment objective?",
      type: "radio",
      options: [
        { value: "very_conservative", label: "Very Conservative" },
        { value: "somewhat_conservative", label: "Somewhat Conservative" },
        { value: "moderate", label: "Moderate" },
        { value: "somewhat_aggressive", label: "Somewhat Aggressive" },
        { value: "very_aggressive", label: "Very Aggressive" }
      ]
    },
    {
        question: "How many years from now will you begin to make withdrawals from your investments for living expenses or retirement purposes?",
        type: "radio",
        options: [
          { value: "curr_withdrawals", label: "I am currently taking withdraws" },
          { value: "next_year", label: "Within the next year" },
          { value: "2-5", label: "2-5 years" },
          { value: "6-10", label: "6-10 years" },
          { value: "11-20", label: "11-20 years" },
          { value: "20+", label: "20+ years" }
        ]
      }
    
  ];
  

const WealthQuestionnaire = () => {
  const handleComplete = (answers) => {
    console.log('Wealth Management answers:', answers);
    // Handle submission logic here
  };

  return (
    <PageTransition>
    <div>
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
    <QuestionnaireLayout
      questions={wealthQuestions}
      onComplete={handleComplete}
      title="Wealth Management Questionnaire"
    />
    </div>
    </PageTransition>
  );
};

export default WealthQuestionnaire;