import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ error: 'No user ID provided' });
    }

    try {
        // Get the linked account with its tokens
        const { data: linkedAccount, error: accountError } = await supabase
            .from('linked_brokerage_accounts')
            .select('*')
            .eq('user_id', userId)
            .eq('provider', 'Schwab')
            .single();

        if (accountError) {
            throw accountError;
        }

        // Check if token needs refresh
        const tokenExpiry = new Date(linkedAccount.token_expires_at);
        let accessToken = linkedAccount.access_token;

        if (tokenExpiry <= new Date()) {
            // Reuse your existing refresh token function
            const authString = Buffer.from(
                `${process.env.REACT_APP_SCHWAB_CLIENT_ID}:${process.env.REACT_APP_SCHWAB_CLIENT_SECRET}`
            ).toString('base64');

            const refreshResponse = await fetch('https://api.schwabapi.com/v1/oauth/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${authString}`
                },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: linkedAccount.refresh_token
                })
            });

            const tokens = await refreshResponse.json();
            accessToken = tokens.access_token;

            // Update tokens in database
            await supabase
                .from('linked_brokerage_accounts')
                .update({
                    access_token: tokens.access_token,
                    token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString()
                })
                .eq('user_id', userId);
        }

        // Fetch latest account data using valid token
        const accountsResponse = await fetch('https://api.schwabapi.com/trader/v1/accounts', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!accountsResponse.ok) {
            throw new Error('Failed to fetch account data');
        }

        const accountsData = await accountsResponse.json();

        // Update account data in Supabase
        for (const accountWrapper of accountsData) {
            const account = accountWrapper.securitiesAccount;
            const { error: updateError } = await supabase
                .from('linked_brokerage_accounts')
                .update({
                    metadata: {
                        positions: account.positions,
                        balances: {
                            current: account.currentBalances,
                            initial: account.initialBalances,
                            projected: account.projectedBalances
                        }
                    }
                })
                .eq('user_id', userId)
                .eq('account_id', account.accountNumber);

            if (updateError) throw updateError;
        }

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error('Update error:', error);
        return res.status(500).json({ 
            error: 'Failed to update account data',
            message: error.message 
        });
    }
}