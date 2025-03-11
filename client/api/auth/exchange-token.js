import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function refreshToken(refresh_token) {
    try {
        const authString = Buffer.from(
            `${process.env.REACT_APP_SCHWAB_CLIENT_ID}:${process.env.REACT_APP_SCHWAB_CLIENT_SECRET}`
        ).toString('base64');

        const response = await fetch('https://api.schwabapi.com/v1/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${authString}`
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refresh_token
            })
        });

        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }

        const tokens = await response.json();
        
        // Update tokens in database
        const { error: dbError } = await supabase
            .from('linked_brokerage_accounts')
            .update({
                access_token: tokens.access_token,
                token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString()
            })
            .eq('refresh_token', refresh_token);

        if (dbError) throw dbError;
        
        return tokens.access_token;
    } catch (error) {
        console.error('Token refresh error:', error);
        throw error;
    }
}

export default async function handler(req, res) { 
    console.log('Exchange token endpoint hit');
    console.log('Request body:', req.body);
    // Handle CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');


    
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // Add handling for refresh token requests
    if (req.body.refresh_token) {
        try {
            const newToken = await refreshToken(req.body.refresh_token);
            return res.status(200).json({ access_token: newToken });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to refresh token' });
        }
    }

    try {
        const { code, state } = req.body;

         // Exchange code for tokens with Schwab API
         const authString = Buffer.from(
            `${process.env.REACT_APP_SCHWAB_CLIENT_ID}:${process.env.REACT_APP_SCHWAB_CLIENT_SECRET}`).toString('base64');
        

        // URL decode the authorization code as specified
        const decodedCode = decodeURIComponent(code);
        
        console.log("BEFORE THE TOKENRESPONSE!!")
        const tokenResponse = await fetch('https://api.schwabapi.com/v1/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${authString}`,
                'Accept': 'application/json' 
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: decodedCode,
                redirect_uri: process.env.REACT_APP_SCHWAB_REDIRECT_URI,
                client_id: process.env.REACT_APP_SCHWAB_CLIENT_ID
            }).toString()
        });

        console.log("AFTER THE TOKENRESPONSE!!", tokenResponse);
        
        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.text();
            console.error('Detailed token exchange error:', {
                status: tokenResponse.status,
                statusText: tokenResponse.statusText,
                headers: tokenResponse.headers,
                error: errorData
            });
            return res.status(tokenResponse.status).json({ 
                error: 'Token exchange failed',
                details: errorData
            });
        }
        
        const tokens = await tokenResponse.json();
        
        // Get account information
        const accountsResponse = await fetch('https://api.schwabapi.com/v1/accounts', {
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
                refresh_token_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                metadata: account
            });
        }
        
        if (dbError) {
            console.error('Database error:', dbError);
            return res.status(500).json({ error: 'Failed to store account information' });
        }
         
        return res.status(200).json({ 
            success: true,
            accounts: accounts.accounts 
        });
        
    } catch (error) {
        console.error('Detailed error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message
        });
    }
}