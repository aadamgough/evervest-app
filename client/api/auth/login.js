import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

// Add console.log to debug environment variables
console.log('Supabase URL:', process.env.REACT_APP_SUPABASE_URL);
console.log('Supabase Key exists:', !!process.env.REACT_APP_SUPABASE_ANON_KEY);

if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(
    process.env.REACT_APP_SUPABASE_URL,
    process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Use Supabase's built-in auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error('Supabase auth error:', error);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Get additional user data if needed
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, name, email')
            .eq('id', data.user.id)
            .single();

        if (userError) {
            console.error('User data fetch error:', userError);
            return res.status(500).json({ message: 'Error fetching user data' });
        }

        return res.status(200).json({
            message: 'Login successful',
            user: userData,
            session: data.session
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}