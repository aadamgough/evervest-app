// Import Supabase client
import { supabase } from '../lib/supabaseClient';

export async function ensureFreshToken() {
    try {
        // Get current user session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            throw new Error('No active session');
        }

        const userId = session.user.id;
        // Get current token info
        const { data: account } = await supabase
            .from('linked_brokerage_accounts')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (!account) return null;

        const tokenExpiry = new Date(account.token_expires_at);
        const now = new Date();
        
        // If token expires in less than 5 minutes, refresh it
        if (tokenExpiry.getTime() - now.getTime() < 5 * 60 * 1000) {
            const response = await fetch('/api/auth/exchange-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    refresh_token: account.refresh_token
                })
            });

            if (!response.ok) {
                throw new Error('Failed to refresh token');
            }

            const { access_token } = await response.json();
            return access_token;
        }

        return account.access_token;
    } catch (error) {
        console.error('Token check error:', error);
        throw error;
    }
}