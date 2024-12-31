const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 5001;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Path to users.json file
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

// Helper functions to read and write to users.json
async function readUsers() {
    try {
        const data = await fs.readFile(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist, return empty users array
        return { users: [] };
    }
}

async function writeUsers(users) {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

// Signup endpoint
app.post('/api/signup', async (req, res) => {
    console.log('Received signup request:', req.body);
    
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Please provide all required fields'
            });
        }

        // Read existing users
        const userData = await readUsers();
        
        // Check if user already exists
        const existingUser = userData.users.find(user => user.email === email);
        if (existingUser) {
            return res.status(400).json({
                message: 'Email already registered'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user object
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password: hashedPassword
        };

        // Add to users array
        userData.users.push(newUser);

        // Save to file
        await writeUsers(userData);

        // Send success response (excluding password)
        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            message: 'Error creating user',
            error: error.message
        });
    }
});

// Add this login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const userData = await readUsers();
        const user = userData.users.find(u => u.email === email);
        
        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        // Send user info in response
        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            message: 'Error during login',
            error: error.message
        });
    }
});
// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});