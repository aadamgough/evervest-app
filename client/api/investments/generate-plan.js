import { createClient } from '@supabase/supabase-js';

console.log('LLAMA API Key exists:', !!process.env.LLAMA_API_KEY);

// Add console.log to debug environment variables
console.log('Supabase URL:', process.env.REACT_APP_SUPABASE_URL);
console.log('Supabase Key exists:', !!process.env.REACT_APP_SUPABASE_ANON_KEY);

if (!process.env.REACT_APP_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(
    process.env.REACT_APP_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper function to verify user authentication
async function verifyAuth(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        throw new Error('No authorization header');
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
        throw new Error('Invalid token');
    }

    return user;
}

export default async function handler(req, res) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Verify authentication
        if (!process.env.LLAMA_API_KEY) {
            console.error('LLAMA API Key is missing');
            return res.status(500).json({ error: 'LLAMA API configuration is missing' });
        }
        const user = await verifyAuth(req);
        const { user_id, selected_options, plan_details } = req.body;

        // Verify user_id matches authenticated user
        if (user.id !== user_id) {
            return res.status(403).json({ error: 'User ID mismatch' });
        }

        // Format the prompt for LLaMA API
        let prompt = `
        # CONTEXT #
        You are a financial advisor seeking an optimized investment plan for a client. You will be given a list of client responses to a questionnaire 
        that deals with their financial situation, risk tolerance, and investment goals.

        # OBJECTIVE #
        Your goal is to use this information to build a personalized investment plan for the client, that includes investment accounts they should open
        and the allocation of their assets across those accounts. You need to take in every question that the client answered and use it to build the plan;
        this is important.

        # STYLE #
        The investment plan needs to be clear and concise, and should be written in a way that is easy to understand. There should be very brief explanations
        of the reasoning behind the investment plan before the specific accounts and their holdings are generated. When referencing the client, refer to them
        as 'you' or 'your'. 
        
        For every account, provide the client with an asset allocation with percentages for each asset class. This part should be very concise.

        # OUTPUT #
        The output should be a list of investment accounts the client should open, and the allocation of their assets across those accounts.

        `;

        // Add questionnaire responses to prompt
        if (selected_options.wealthManagement && plan_details?.wmq_answers) {
            prompt += "\nWealth Management Responses:\n";
            Object.entries(plan_details.wmq_answers).forEach(([question, answer]) => {
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

        if (!llamaResponse.ok) {
            const errorText = await llamaResponse.text();
            console.error('LLaMA API error:', errorText);
            return res.status(500).json({ error: 'Failed to generate plan from LLaMA API' });
        }

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
                        generated_plan: planData.choices[0].message.content
                    }
                }
            ])
            .select();

        if (error) {
            console.error('Database insert error:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(201).json(data);
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ error: 'Failed to generate investment plan' });
    }
}