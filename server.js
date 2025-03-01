require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// Verify environment variables are loaded
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('Required environment variables are missing');
    process.exit(1);
}

const supabase = createClient(
    process.env.SUPABASE_URL,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const investmentRoutes = require('./routes/investments');

// Database test endpoint
app.get('/api/test-db', async (req, res) => {
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

        res.status(200).json({
            message: 'Database connection successful',
            data: data
        });
    } catch (error) {
        console.error('Test endpoint error:', error);
        res.status(500).json({ 
            message: 'Test failed',
            error: error.message 
        });
    }
});

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/investments', investmentRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});