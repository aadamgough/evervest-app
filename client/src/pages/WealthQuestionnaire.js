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
        { value: "Under $50,000", label: "Under $50,000" },
        { value: "$50,000 - $100,000", label: "$50,000 - $100,000" },
        { value: "$100,000 - $250,000", label: "$100,000 - $250,000" },
        { value: "Over $250,000", label: "Over $250,000" }
      ]
    },
    {
      question: "Please select one of the following:",
      type: "radio",
      options: [
        {
          value: "I am a qualified purchaser as defined by at least $5+ million of investable assets",
          label: "I am a qualified purchaser as defined by at least $5+ million of investable assets"
        },
        {
          value: "I am a qualified client as defined by at least $2.2M of net worth, not including my primary residence",
          label: "I am a qualified client as defined by at least $2.2M of net worth, not including my primary residence"
        },
        {
          value: "I am an accredited investor as defined by at least $1M of net worth, not including my primary residence",
          label: "I am an accredited investor as defined by at least $1M of net worth, not including my primary residence"
        },
        {
          value: "I am an accredited investor as defined by income over $200,000 if single, or $300,000 if married",
          label: "I am an accredited investor as defined by income over $200,000 if single, or $300,000 if married"
        },
        {
          value: "My current annual income is below $200,000 or I am married and our joint income is below $300,000 combined",
          label: "My current annual income is below $200,000 or I am married and our joint income is below $300,000 combined"
        }
      ]
    },
    {
      question: "When it comes to investing in stocks, bonds, or mutual funds, I would describe myself as ...",
      type: "radio",
      options: [
        { value: "Very Inexperienced", label: "Very Inexperienced" },
        { value: "Somewhat Inexperienced", label: "Somewhat Inexperienced" },
        { value: "Somewhat Experienced", label: "Somewhat Experienced" },
        { value: "Experienced", label: "Experienced" },
        { value: "Very Experienced", label: "Very Experienced" }
      ]
    },
    {
      question: "How would you describe your investment objective?",
      type: "radio",
      options: [
        { value: "Very Conservative", label: "Very Conservative" },
        { value: "Somewhat Conservative", label: "Somewhat Conservative" },
        { value: "Moderate", label: "Moderate" },
        { value: "Somewhat Aggressive", label: "Somewhat Aggressive" },
        { value: "Very Aggressive", label: "Very Aggressive" }
      ]
    },
    {
        question: "How many years from now will you begin to make withdrawals from your investments for living expenses or retirement purposes?",
        type: "radio",
        options: [
          { value: "I am currently taking withdraws", label: "I am currently taking withdraws" },
          { value: "Within the next year", label: "Within the next year" },
          { value: "2-5 years", label: "2-5 years" },
          { value: "6-10 years", label: "6-10 years" },
          { value: "11-20 years", label: "11-20 years" },
          { value: "20+ years", label: "20+ years" }
        ]
      },
      {
        question: "As I withdraw money from these investments, I would likely use the income over a period of ...",
        type: "radio",
        options: [
          { value: "2 years or less", label: "2 years or less" },
          { value: "3-5 years", label: "3-5 years" },
          { value: "6-10 years", label: "6-10 years" },
          { value: "10-15 years", label: "10-15 years" },
          { value: "15+ years", label: "15+ years" }
        ]
      },
      {
        question: "Which of the following best describes your investment goals?",
        type: "radio",
        options: [
          { value: "2 years or less", label: "2 years or less" },
          { value: "3-5 years", label: "3-5 years" },
          { value: "6-10 years", label: "6-10 years" },
          { value: "10-15 years", label: "10-15 years" },
          { value: "15+ years", label: "15+ years" }
        ]
      },
      {
        question: "How comfortable are you with an investment portfolio that may fluctuate in value if it has the potential for greater returns over the long run?",
        type: "radio",
        options: [
          { value: "Very uncomfortable, I'd have a hard time tolerating any loss", label: "Very uncomfortable, I'd have a hard time tolerating any loss" },
          { value: "Uncomfortable, I could tolerate a minimal loss", label: "Uncomfortable, I could tolerate a minimal loss" },
          { value: "Moderately Comfortable, I could tolerate some loss", label: "Moderately Comfortable, I could tolerate some loss" },
          { value: "Comfortable, I could tolerate a loss in the short to intermidate term", label: "Comfortable, I could tolerate a loss in the short to intermidate term" },
          { value: "Very Comfortable, I understand my balance may fluctuate significantly", label: "Very Comfortable, I understand my balance may fluctuate significantly" }
        ]
      },
      {
        question: "If you had $100,000 to invest, what would you expect at the end of one year?",
        type: "radio",
        options: [
          { value: "A balance between $99,000 and $103,000", label: "A balance between $99,000 and $103,000" },
          { value: "A balance between $97,000 and $105,000", label: "A balance between $97,000 and $105,000" },
          { value: "A balance between $95,000 and $107,000", label: "A balance between $95,000 and $107,000" },
          { value: "A balance between $90,000 and $112,000", label: "A balance between $90,000 and $112,000" },
          { value: "A balance between $85,000 and $115,000", label: "A balance between $85,000 and $115,000" }
        ]
      },
      {
        question: "How would you react if your portfolio suddenly declined by 20%?",
        type: "radio",
        options: [
          { value: "Move to cash preserve the remaining asset value", label: "Move to cash preserve the remaining asset value" },
          { value: "Reallocate to a more conservative portfolio", label: "Reallocate to a more conservative portfolio" },
          { value: "Maintain the same portfolio and reevaluate in six months", label: "Maintain the same portfolio and reevaluate in six months" },
          { value: "Maintain the same portfolio as you understand that volatility is part of the risk", label: "Maintain the same portfolio as you understand that volatility is part of the risk" },
          { value: "Reallocate to a more aggresive portfolio to take advantage of the market downturn", label: "Reallocate to a more aggresive portfolio to take advantage of the market downturn" }
        ]
      },
      {
        question: "What percentage of your long-term investments would you want to have a floor beneath to protect from any loss of principal?",
        type: "radio",
        options: [
          { value: "0%-25%", label: "0%-25%" },
          { value: "26%-50%", label: "26%-50%" },
          { value: "51%-75%", label: "51%-75%" },
          { value: "76%-100%", label: "76%-100%" },
          { value: "Not sure", label: "Not sure" }
        ]
      },
      {
        question: "In regards to your long-term investments, what percentage would you prefer to have liquid and accessible on a daily basis?",
        type: "radio",
        options: [
          { value: "0%-25%", label: "0%-25%" },
          { value: "26%-50%", label: "26%-50%" },
          { value: "51%-75%", label: "51%-75%" },
          { value: "76%-100%", label: "76%-100%" },
          { value: "Not sure", label: "Not sure" }
        ]
      }
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
            // Step 1: Format the new answers
            const formattedAnswers = {};
            wealthQuestions.forEach((q, index) => {
                formattedAnswers[q.question] = wmq_answers[index];
            });
            console.log('Formatted new answers:', formattedAnswers);
    
            // Step 2: Check for existing response with detailed error handling
            const { data: existingResponse, error: fetchError } = await supabase
                .from('questionnaire_responses')
                .select('*')  
                .eq('user_id', user.id)
                .maybeSingle(); 
    
            console.log('Existing response:', existingResponse);
            console.log('Fetch error:', fetchError);
    
            let response;
            if (existingResponse) {
                console.log('Updating existing response...');
                response = await supabase
                    .from('questionnaire_responses')
                    .update({
                        wmq_answers: formattedAnswers
                    })
                    .eq('user_id', user.id)
                    .select();  // Add .select() to get the updated data back
            } else {
                console.log('Creating new response...');
                response = await supabase
                    .from('questionnaire_responses')
                    .insert([{  // Wrap in array as per Supabase requirements
                        user_id: user.id,
                        wmq_answers: formattedAnswers
                    }])
                    .select();  // Add .select() to get the inserted data back
            }
    
    
            if (response.error) {
                console.error('Response error:', response.error);
                throw response.error;
            }
    
            // Add additional check to ensure we have data
            if (!response.data) {
                throw new Error('No data returned from update/insert operation');
            }
    
            navigate('/dashboard');
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