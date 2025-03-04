const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Required Supabase environment variables are missing in auth.js');
    process.exit(1);
}

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Signup route
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Please provide all required fields',
            });
        }

        // Check existing user
        const { data: existingUser, error: findError } = await supabase
            .from('users')
            .select('email')
            .eq('email', email)
            .single();

        if (findError && findError.code !== 'PGRST116') {
            console.error('Supabase find error:', findError);
            return res.status(500).json({ message: 'Error checking user existence' });
        }

        if (existingUser) {
            return res.status(400).json({
                message: 'Email already registered',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([{ 
                name, 
                email, 
                password: hashedPassword,
                created_at: new Date().toISOString()
            }])
            .select('id, name, email, created_at')
            .single();

        if (insertError) {
            console.error('Supabase insert error:', insertError);
            return res.status(500).json({ message: 'Error creating user' });
        }

        res.status(201).json({
            message: 'User created successfully',
            user: newUser
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const { data: user, error: findError } = await supabase
            .from('users')
            .select('id, name, email, password')
            .eq('email', email)
            .single();

        if (findError) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const { password: _, ...userWithoutPassword } = user;

        res.status(200).json({
            message: 'Login successful',
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.post('/exchange-token', async (req, res) => {
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
        const tokenResponse = await fetch('https://api.schwab.com/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${process.env.SCHWAB_CLIENT_ID}:${process.env.SCHWAB_CLIENT_SECRET}`).toString('base64')}`
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: process.env.REDIRECT_URI || 'http://localhost:3000/auth/callback'
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
                access_token: tokens.access_token, // In production, encrypt this
                refresh_token: tokens.refresh_token, // In production, encrypt this
                token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
                metadata: account
            });
        }
        
        res.status(200).json({ success: true });
        
    } catch (error) {
        console.error('Token exchange error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;