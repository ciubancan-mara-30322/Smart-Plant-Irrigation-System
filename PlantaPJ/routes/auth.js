const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. Register Route (Create Account)
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Verify if the email is already used
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "This email is already in use!" });

        // Encrypt the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save the new user in the database
        user = new User({ username, email, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: "Account created successfully! You can log in now." });
    } catch (err) {
        console.error("Error registering user:", err);
        res.status(500).json({ message: "Error on server while registering" });
    }
});

// 2. Login Route (Authenticate User)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Search for the user by email
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Email or password is incorrect!" });

        // Compare the provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Email or password is incorrect!" });

        // Generate a JWT token (we can use a secret from .env or a default
        const token = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET || "secret_key", 
            { expiresIn: '24h' }
        );

        // Send the token and user info back to the client
        res.json({ 
            token, 
            user: { 
                id: user._id, 
                username: user.username,
                email: user.email 
            } 
        });

        console.log(`✅ Logged user: ${user.username}`);
    } catch (err) {
        console.error("Error logging in:", err);
        res.status(500).json({ message: "Error logging in" });
    }
});

module.exports = router;