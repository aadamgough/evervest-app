import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

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

        return res.status(200).json({
            message: 'Database connection successful',
            data: data
        });
    } catch (error) {
        console.error('Test endpoint error:', error);
        return res.status(500).json({ 
            message: 'Test failed',
            error: error.message 
        });
    }
}