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

module.exports = router;