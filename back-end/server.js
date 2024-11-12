const express = require('express');
const app = express();
const PORT = 5001;
const cors = require('cors');
app.use(cors());

// Middleware to parse JSON requests
app.use(express.json());

// Sample API endpoint
app.post('/api/signup', (req, res) => {
    const { name, email, password } = req.body;
    console.log('Received sign-up data:', req.body);

    // Example response
    res.status(201).json({ message: 'User created successfully!' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
