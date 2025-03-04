import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { code, state } = req.body;
        
        // Verify state matches a user ID
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('id', state)
            .single();
            
        if (userError || !userData) {
            return res.status(400).json({ error: 'Invalid state parameter' });
        }
        
        // Exchange code for tokens with Schwab API
        const tokenResponse = await fetch('https://api.schwabapi.com/v1/oauth/authorize?response_type=code&client_id=1wzwOrhivb2PkR1UCAUVTKYqC4MTNYlj&scope=readonly&redirect_uri=https://developer.schwab.com/oauth2-redirect.html', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${process.env.SCHWAB_CLIENT_ID}:${process.env.SCHWAB_CLIENT_SECRET}`).toString('base64')}`
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: process.env.REDIRECT_URI
            })
        });
        
        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.text();
            console.error('Token exchange error:', errorData);
            return res.status(400).json({ error: 'Failed to exchange token' });
        }
        
        const tokens = await tokenResponse.json();
        
        // Get account information
        const accountsResponse = await fetch('https://api.schwab.com/v1/accounts', {
            headers: {
                'Authorization': `Bearer ${tokens.access_token}`
            }
        });
        
        if (!accountsResponse.ok) {
            return res.status(400).json({ error: 'Failed to fetch account information' });
        }
        
        const accounts = await accountsResponse.json();
        
        // Store account information in database
        for (const account of accounts.accounts) {
            await supabase.from('linked_brokerage_accounts').insert({
                user_id: state,
                provider: 'Schwab',
                account_id: account.account_id,
                account_name: account.nickname || `Schwab ${account.account_type}`,
                account_type: account.account_type,
                account_number_last4: account.mask,
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
                metadata: account
            });
        }
        
        return res.status(200).json({ success: true });
        
    } catch (error) {
        console.error('Token exchange error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}