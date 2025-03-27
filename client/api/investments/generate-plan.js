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
        CONTEXT
        You are an experienced financial advisor specializing in personalized investment strategies. You have received a detailed questionnaire with the client's financial situation, risk tolerance, and investment goals. Your task is to analyze their responses and create an optimized investment plan tailored to their needs.

        OBJECTIVE
        Your goal is to generate a clear, well-structured investment plan that:

        Identifies the specific types of investment accounts the client should open (e.g., taxable brokerage, Roth IRA, traditional IRA, 401(k)).

        Allocates assets within those accounts based on the clients risk profile and investment goals.

        Incorporates all available client information when constructing the plan—every answered question must inform the recommendations.

        STYLE & CLARITY
        The investment plan must be clear, concise, and easy to understand.

        Provide a brief explanation of the strategy before listing accounts and allocations. Keep explanations minimal but informative.

        Use direct language and refer to the client as "you" or "your" (e.g., "You should open a Roth IRA and allocate 60% to equities...").

        Ensure the recommendations are actionable, avoiding vague or general advice.

        OUTPUT FORMAT
        The response should be structured as follows:

        Investment Strategy Overview (2-3 sentences summarizing the reasoning behind the allocation based on the client's responses)

        Recommended Accounts & Asset Allocation (List of accounts, each with a percentage breakdown of asset allocation)

        Account Name (e.g., Roth IRA, 401(k))

        Asset Class 1: X%

        Asset Class 2: Y%

        Asset Class 3: Z%

        Ensure that the total allocation across all accounts adds up to 100%.
        `;

        // Add questionnaire responses to prompt
        if (selected_options.wealthManagement && plan_details?.wmq_answers) {
            prompt += "\nWealth Management Responses:\n";
            Object.entries(plan_details.wmq_answers).forEach(([question, answer]) => {
                prompt += `${question}: ${answer}\n`;
            });
        }

        const requestBody = {
            model: "llama3.1-70b", 
            messages: [{
                role: "user",
                content: prompt.trim()
            }],
            temperature: 0.7,
            max_tokens: 5000,
            top_p: 1,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
            stream: false,
            n: 1
        };

        // Call LLaMA API
        const llamaResponse = await fetch('https://api.llama-api.com/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.LLAMA_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });


        if (!llamaResponse.ok) {
            const errorText = await llamaResponse.text();
            console.error('LLaMA API error details:', {
                status: llamaResponse.status,
                statusText: llamaResponse.statusText,
                error: errorText,
                requestConfig: {
                    model: requestBody.model,
                    promptLength: prompt.length,
                    max_tokens: requestBody.max_tokens
                }
            });
            return res.status(500).json({ 
                error: 'Failed to generate plan from LLaMA API',
                details: errorText
            });
        }

        const planData = await llamaResponse.json();

        // Insert into database with LLaMA-generated plan
        const { data, error } = await supabase
            .from('investment_plans')
            .upsert([
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