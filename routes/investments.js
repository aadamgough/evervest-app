const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const authenticateUser = require('../middleware/auth');

router.post('/generate-plan', authenticateUser, async (req, res) => {
    try {
        const { user_id, selected_options, plan_details } = req.body;

        console.log('Received request body:', req.body);

        // Verify user_id matches authenticated user
        if (req.user.id !== user_id) {
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

        res.status(201).json(data);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Failed to generate investment plan' });
    }
});

module.exports = router;