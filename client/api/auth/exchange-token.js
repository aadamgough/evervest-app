import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function refreshToken(refresh_token) {
    console.log("REFRESH TOKEN FUNCTION CALLED");
    try {
        const authString = Buffer.from(
            `${process.env.REACT_APP_SCHWAB_CLIENT_ID}:${process.env.REACT_APP_SCHWAB_CLIENT_SECRET}`
        ).toString('base64');

        console.log("AUTH STRING inside refreshToken function", authString);

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

        console.log("RESPONSE inside refreshToken function", response);

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

    // Get the authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No authorization header' });
    }

    // Extract user ID from request body
    const { code, state, userId } = req.body;
    if (!userId) {
        return res.status(400).json({ error: 'No user ID provided' });
    }

    console.log('User ID from request:', userId);

    // Handle CORS
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return res.status(200).end();
    }

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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
        const authString = Buffer.from(
            `${process.env.REACT_APP_SCHWAB_CLIENT_ID}:${process.env.REACT_APP_SCHWAB_CLIENT_SECRET}`
        ).toString('base64');
    
        const decodedCode = decodeURIComponent(code);
        
        console.log("BEFORE THE TOKENRESPONSE!!");
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
        
        // Read the response body only once
        const responseText = await tokenResponse.text();
        console.log("Token Response Body:", responseText);
        
        let tokens;
        try {
            tokens = JSON.parse(responseText);
            console.log("Parsed tokens:", tokens);
            
            if (!tokens.access_token) {
                console.error("No access token in response:", tokens);
                return res.status(400).json({ 
                    error: 'Invalid token response',
                    details: tokens
                });
            }


            console.log("Attempting to fetch accounts with token:", tokens.access_token.substring(0, 20) + '...');

            // Get account information using the parsed tokens
            const accountsResponse = await fetch('https://api.schwabapi.com/trader/v1/accounts', {
                headers: {
                    'Authorization': `Bearer ${tokens.access_token}`
                }
            });
            
            if (!accountsResponse.ok) {
                const errorText = await accountsResponse.text();
                console.error('Account fetch failed:', {
                    status: accountsResponse.status,
                    statusText: accountsResponse.statusText,
                    error: errorText
                });
                return res.status(400).json({ 
                    error: 'Failed to fetch account information',
                    details: errorText
                });
            }
            
            const accountsData = await accountsResponse.json();
            console.log('Accounts response:', accountsData);

            // Adjust the database storage loop for the new structure
            for (const accountWrapper of accountsData) {
                const account = accountWrapper.securitiesAccount;
                const { error: dbError } = await supabase.from('linked_brokerage_accounts').insert({
                    user_id: userId,
                    provider: 'Schwab',
                    account_id: account.accountNumber,
                    account_name: `Schwab Account ${account.accountNumber}`,
                    account_type: 'securities',  // or derive from account data if available
                    account_number_last4: account.accountNumber.slice(-4),
                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token,
                    token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
                    refresh_token_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    metadata: {
                        positions: account.positions,
                        balances: {
                            current: account.currentBalances,
                            initial: account.initialBalances,
                            projected: account.projectedBalances
                        }
                    }
                });
    
                if (dbError) {
                    console.error('Database error:', dbError);
                    return res.status(500).json({ error: 'Failed to store account information' });
                }
            }
             
            return res.status(200).json({ 
                success: true,
                accounts: accounts.accounts 
            });
            
        } catch (parseError) {
            console.error("Error parsing token response:", parseError);
            return res.status(500).json({ 
                error: 'Failed to parse token response',
                details: responseText
            });
        }
        
    } catch (error) {
        console.error('Detailed error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message
        });
    }
}