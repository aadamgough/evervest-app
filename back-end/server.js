const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');

// Environment variables should be in a .env file
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const PORT = process.env.PORT || 5001;

// Llama API setup
const LLAMA_API_KEY = process.env.LLAMA_API_KEY;

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Add this test endpoint
app.get('/api/test-db', async (req, res) => {
    try {

        const { data, error } = await supabase
            .from('users')
            .select('count');

        if (error) {
            console.error('Supabase test error:', error);
            return res.status(500).json({ 
                message: 'Database connection failed',
                error: error.message 
            });
        }

        res.status(200).json({
            message: 'Database connection successful',
            data: data
        });
    } catch (error) {
        console.error('Test endpoint error:', error);
        res.status(500).json({ 
            message: 'Test failed',
            error: error.message 
        });
    }
});

// Signup endpoint
app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Please provide all required fields',
            });
        }

        // Check existing user
        const { data: existingUser, error: findError } = await supabase
            .from('users')
            .select('email')  // Only select email field for efficiency
            .eq('email', email)
            .single();

        if (findError && findError.code !== 'PGRST116') { // Handle "not found" separately
            console.error('Supabase find error:', findError);
            return res.status(500).json({ message: 'Error checking user existence' });
        }

        if (existingUser) {
            return res.status(400).json({
                message: 'Email already registered',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([
                { 
                    name, 
                    email, 
                    password: hashedPassword,
                    created_at: new Date().toISOString() // Add timestamp
                }
            ])
            .select('id, name, email, created_at')  // Only select needed fields
            .single();

        if (insertError) {
            console.error('Supabase insert error:', insertError);
            return res.status(500).json({ message: 'Error creating user' });
        }

        res.status(201).json({
            message: 'User created successfully',
            user: newUser
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const { data: user, error: findError } = await supabase
            .from('users')
            .select('id, name, email, password')  // Only select needed fields
            .eq('email', email)
            .single();

        if (findError) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Remove password from user object before sending
        const { password: _, ...userWithoutPassword } = user;

        res.status(200).json({
            message: 'Login successful',
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/api/generate-plan', async (req, res) => {
    try {
        console.log('Received request body:', req.body);
        const { user_id, selectedOptions, questionnaire_responses } = req.body;

        //validate request date
        if (!user_id || !selectedOptions){
            console.log('Missing required data');
            console.log('Missing required data:', { user_id, selectedOptions });
            return res.status(400).json({
                message: 'Missing required data'
            });
        }

        //Format the prompt based on selected options and their repsonses
        let prompt = 'I am a financial advisor seeking an optimized investment plan for a client based ' +
        'on their financial situation, risk tolerance, and investment goals. ' +
        'Provide a strategic investmnet plan for the client, including allocation ' +
        'percentages, accounts they should open, and reasoning.';
        try {
            if (selectedOptions.wealthManagement && questionnaire_responses?.wmq_answers) {
                prompt += "Wealth Management Responses:\n";
                Object.entries(questionnaire_responses.wmq_answers).forEach(([question, answer]) => {
                    prompt += `${question}: ${answer}\n`;
                });
            }

            if (selectedOptions.riskTolerance && questionnaire_responses?.risktol_answers) {
                prompt += "\nRisk Tolerance Responses:\n";
                Object.entries(questionnaire_responses.risktol_answers).forEach(([question, answer]) => {
                    prompt += `${question}: ${answer}\n`;
                });
            }

            if (selectedOptions.esgPhilosophy && questionnaire_responses?.esg_answers) {
                prompt += "\nESG Philosophy Responses:\n";
                Object.entries(questionnaire_responses.esg_answers).forEach(([question, answer]) => {
                    prompt += `${question}: ${answer}\n`;
                });
            }
            console.log('Generated prompt:', prompt);
        } catch (error) {
            console.error('Error formatting prompt:', error);
            throw new Error('Failed to format questionnaire data');
        }

        // Make request to Llama API
        const llamaResponse = await fetch('https://api.llama-api.com/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${LLAMA_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "llama3.2-3b",
                messages: [{
                    role: "user",
                    content: prompt
                }],
                temperature: 0.7,
                max_tokens: 2000
            })
        });
        

        const planData = await llamaResponse.json();
        console.log("after request to llama", planData)

        // Store the plan and selected options in Supabase
        const { error: insertError } = await supabase
            .from('investment_plans')
            .insert({
                user_id: user_id,
                selected_options: selectedOptions,
                plan_details: planData.choices[0].message.content,
                created_at: new Date().toISOString()
            });

        if (insertError) {
            console.error('Supabase insert error:', insertError);
            throw new Error('Failed to save investment plan');
        }

        res.status(200).json({
            message: 'Investment plan generated successfully',
            plan: planData.choices[0].message.content
        });
        
    } catch (error){
        console.log("failure1");
        res.status(500).json({
            message: "Failed to generate investment plans",
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});