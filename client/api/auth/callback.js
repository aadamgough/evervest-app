import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { code, state } = req.body;

            // Exchange code for tokens with Schwab
            const tokenResponse = await fetch('https://api.schwabapi.com/v1/oauth/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${Buffer.from(
                        `${process.env.SCHWAB_CLIENT_ID}:${process.env.SCHWAB_CLIENT_SECRET}`
                    ).toString('base64')}`
                },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code,
                    redirect_uri: process.env.SCHWAB_REDIRECT_URI
                })
            });

            const tokens = await tokenResponse.json();

            // Store in Supabase
            const { data, error } = await supabase
                .from('linked_brokerage_accounts')
                .insert([{
                    user_id: state,
                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token,
                    provider: 'Schwab'
                }]);

            if (error) throw error;

            return res.status(200).json({ success: true });

        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
}