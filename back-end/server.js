require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');

// Verify environment variables are loaded
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('Required environment variables are missing');
    process.exit(1);
}


const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY, // Use service role key for server-side operations
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);
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
        // Authentication verification
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Missing authorization header' });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (authError) {
            console.error('Auth error:', authError);
            return res.status(401).json({ error: 'Invalid authentication token' });
        }

        const { user_id, selected_options, plan_details } = req.body;

        // Verify user_id matches authenticated user
        if (user.id !== user_id) {
            return res.status(403).json({ error: 'User ID mismatch' });
        }

        // Format the prompt for LLaMA API
        let prompt = 'I am a financial advisor seeking an optimized investment plan for a client based ' +
            'on their financial situation, risk tolerance, and investment goals. ' +
            'Provide a strategic investment plan for the client, including allocation ' +
            'percentages, accounts they should open, and reasoning.';
        
        // Add questionnaire responses to prompt
        if (selected_options.wealthManagement && plan_details?.wmq_answers) {
            prompt += "\nWealth Management Responses:\n";
            Object.entries(plan_details.wmq_answers).forEach(([question, answer]) => {
                prompt += `${question}: ${answer}\n`;
            });
        }

        if (selected_options.riskTolerance && plan_details?.risktol_answers) {
            prompt += "\nRisk Tolerance Responses:\n";
            Object.entries(plan_details.risktol_answers).forEach(([question, answer]) => {
                prompt += `${question}: ${answer}\n`;
            });
        }

        if (selected_options.esgPhilosophy && plan_details?.esg_answers) {
            prompt += "\nESG Philosophy Responses:\n";
            Object.entries(plan_details.esg_answers).forEach(([question, answer]) => {
                prompt += `${question}: ${answer}\n`;
            });
        }

        // Call LLaMA API
        const llamaResponse = await fetch('https://api.llama-api.com/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.LLAMA_API_KEY}`,
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

        // Insert into database with LLaMA-generated plan
        const { data, error } = await supabase
            .from('investment_plans')
            .insert([
                {
                    user_id,
                    selected_options,
                    plan_details: {
                        ...plan_details,
                        generated_plan: planData.choices[0].message.content // Add the LLaMA response
                    }
                }
            ])
            .select();

        if (error) {
            console.error('Database insert error:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            return res.status(500).json({ error: error.message });
        }

        console.log('Successfully inserted plan:', data);
        res.status(201).json(data);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Failed to generate investment plan' });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});