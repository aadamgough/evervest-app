import React, { useState, useEffect } from 'react';
import QuestionnaireLayout from '../components/QuestionnaireLayout';
import PageTransition from '../PageTransition';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
// Assuming you have a custom auth hook
import { supabase } from '../lib/supabaseClient';


const wealthQuestions = [
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
      },

      {
        question: "As I withdraw money from these investments, I would likely use the income over a period of ...",
        type: "radio",
        options: [
          { value: "2_yrs_less", label: "2 years or less" },
          { value: "next_year", label: "3-5 years" },
          { value: "2-5", label: "6-10 years" },
          { value: "6-10", label: "10-15 years" },
          { value: "11-20", label: "15+ years" },
        ]
      },

      {
        question: "Which of the following best describes your investment goals?",
        type: "radio",
        options: [
          { value: "avoid_loss", label: "2 years or less" },
          { value: "conservative", label: "3-5 years" },
          { value: "moderate", label: "6-10 years" },
          { value: "long_term", label: "10-15 years" },
          { value: "aggressive", label: "15+ years" },
        ]
      },

      {
        question: "How comfortable are you with an investment portfolio that may fluctuate in value if it has the potential for greater returns over the long run?",
        type: "radio",
        options: [
          { value: "very_uncomfortable", label: "Very uncomfortable, I'd have a hard time tolerating any loss" },
          { value: "uncomfortable", label: "Uncomfortable, I could tolerate a minimal loss" },
          { value: "moderately_comfortable", label: "Moderately Comfortable, I could tolerate some loss" },
          { value: "comfortable", label: "Comfortable, I could tolerate a loss in the short to intermidate term" },
          { value: "very_comfortable", label: "Very Comfortable, I understand my balance may fluctuate significantly" },
        ]
      },

      {
        question: "If you had $100,000 to invest, what would you expect at the end of one year?",
        type: "radio",
        options: [
          { value: "99_103", label: "A balance between $99,000 and $103,000" },
          { value: "97_105", label: "A balance between $97,000 and $105,000" },
          { value: "95_107", label: "A balance between $95,000 and $107,000" },
          { value: "90_112", label: "A balance between $90,000 and $112,000" },
          { value: "85_115", label: "A balance between $85,000 and $115,000" },
        ]
      },

      {
        question: "How would you react if your portfolio suddenly declined by 20%?",
        type: "radio",
        options: [
          { value: "cash", label: "Move to cash preserve the remaining asset value" },
          { value: "reallocate", label: "Reallocate to a more conservative portfolio" },
          { value: "maintain_reevaluate", label: "Maintain the same portfolio and reevaluate in six months" },
          { value: "maintain", label: "Maintain the same portfolio as you understand that volatility is part of the risk" },
          { value: "realloc_aggressive", label: "Reallocate to a more aggresive portfolio to take advantage of the market downturn" },
        ]
      },

      {
        question: "What percentage of your long-term investments would you want to have a floor beneath to protect from any loss of principal?",
        type: "radio",
        options: [
          { value: "0_25", label: "0%-25%" },
          { value: "26_50", label: "26%-50%" },
          { value: "51_75", label: "51%-75%" },
          { value: "76_100", label: "76%-100%" },
          { value: "not_sure", label: "Not sure" },
        ]
      },

      {
        question: "In regards to your long-term investments, what percentage would you prefer to have liquid and accessible on a daily basis?",
        type: "radio",
        options: [
            { value: "0_25", label: "0%-25%" },
            { value: "26_50", label: "26%-50%" },
            { value: "51_75", label: "51%-75%" },
            { value: "76_100", label: "76%-100%" },
            { value: "not_sure", label: "Not sure" },
          ]
      },
      
  ];
  

  const WealthQuestionnaire = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkSession = async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;
            
            if (session?.user) {
            setUser(session.user);
            } else {
            navigate('/');
            }
        } catch (error) {
            console.error('Session error:', error);
            navigate('/');
        }
        };

        checkSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) {
            navigate('/');
        }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    const handleComplete = async (wmq_answers) => {
        if (!user) {
        setError('Please log in to submit the questionnaire');
        navigate('/');
        return;
        }

        setIsSubmitting(true);
        setError(null);
        
        try {
        // Create submission object using authenticated user ID
        const submission = {
            user_id: user.id,
            wmq_answers: wmq_answers,
        };

        // Insert with RLS policies in place
        const { error: insertError } = await supabase
            .from('questionnaire_responses')
            .insert(submission);

        if (insertError) throw insertError;

        navigate('/questionnaire');
        } catch (error) {
        console.error('Error saving questionnaire:', error);
        setError('Failed to save questionnaire. Please try again.');
        } finally {
        setIsSubmitting(false);
        }
    };

    return (
        <PageTransition>
        <div>
            <Navbar isLoggedIn={true}/>
            <QuestionnaireLayout
            questions={wealthQuestions}
            onComplete={handleComplete}
            title="Wealth Management Questionnaire"
            isSubmitting={isSubmitting}
            />
        </div>
        </PageTransition>
    );
    };

export default WealthQuestionnaire;