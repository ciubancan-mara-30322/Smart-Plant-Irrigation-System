require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth'); 
const Plant = require('./models/Plant');
const User = require('./models/User'); 

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); 

// 1. Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB successfully!'))
    .catch((error) => console.error('❌ MongoDB Connection Error:', error));

// --- API ROUTES ---

const jwt = require('jsonwebtoken');

// Middleware for protecting routes (verify JWT token)
const protect = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; 
    
    if (!token) {
        return res.status(401).json({ error: "Access denied. Token missing." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid token." });
    }
};

app.use('/api/auth', authRoutes);

/**
 * 2. Route for ESP8266 to send plant data (POST)
 */
app.post('/api/plants', async (req, res) => {
    try {
        const { name, moisture, temperature, humidity, userId } = req.body;
        let updateData = { moisture, temperature, humidity, userId, date: Date.now() };

        // --- SAFETY MEASURES ---
        // If the moisture is 65% or higher, we force the pump to turn off to prevent overwatering.
        if (moisture >= 65) {
            updateData.isPumpOn = false;
            console.log(`[SAFETY STOP] ${name} has reached ${moisture}%. The pump has been turned off.`);
        }

        const updatedPlant = await Plant.findOneAndUpdate(
            { name: name }, 
            updateData, 
            { upsert: true, returnDocument: 'after' } 
        );

        res.status(200).json(updatedPlant); 
    } catch (error) {
        res.status(500).json({ error: "ESP server error" });
    }
});

/**
 * 3. Manual Control (PATCH)
 * Protection: If the user tries to turn on the pump manually while the moisture is 65% or higher, we block the action and return an error message.
 */
app.patch('/api/plants/:id', async (req, res) => {
    try {
        const { isPumpOn } = req.body;
        const plant = await Plant.findById(req.params.id);
        
        if (isPumpOn === true && plant.moisture >= 65) {
            return res.status(400).json({ 
                error: "The plant is already sufficiently watered (moisture >= 65%). Manual pump activation is blocked to prevent overwatering." 
            });
        }

        const updatedPlant = await Plant.findByIdAndUpdate(
            req.params.id, 
            { isPumpOn }, 
            { new: true }
        );
        res.status(200).json(updatedPlant);
    } catch (error) {
        res.status(500).json({ error: "Error updating plant" });
    }
});

/**
 * 4. Flow Level Adjustment (PATCH)
 */
app.patch('/api/plants/:id/flow', async (req, res) => {
    try {
        const { flowLevel } = req.body;
        const updated = await Plant.findByIdAndUpdate(req.params.id, { flowLevel }, { new: true });
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ error: "Error adjusting flow level" });
    }
});

/**
 * 5. Get all plants for the authenticated user (GET)
 */
app.get('/api/plants', protect, async (req, res) => {
    try {
        const userPlants = await Plant.find({ userId: req.user.id }).sort({ date: -1 }); 
        res.status(200).json(userPlants);
    } catch (error) {
        res.status(500).json({ error: "Error fetching your plants." });
    }
});

/**
 * 6. Manually add a new plant (POST)
 */
app.post('/api/plants/add', protect, async (req, res) => {
    try {
        const { name } = req.body;
        const newPlant = new Plant({
            name,
            userId: req.user.id,
            moisture: 0,
            temperature: 0,
            humidity: 0,
            isPumpOn: false,
            flowLevel: 3 
        });
        await newPlant.save();
        res.status(201).json(newPlant);
    } catch (error) {
        res.status(500).json({ error: "Error adding plant." });
    }
});


/**
 * 7. Edit Plant Details (PATCH)
 */
app.patch('/api/plants/:id/details', async (req, res) => {
    try {
        const { name, userId } = req.body;
        const updated = await Plant.findByIdAndUpdate(req.params.id, { name, userId }, { new: true });
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ error: "Error editing plant details" });
    }
});

/**
 * 8. Delete a plant (DELETE)
 */
app.delete('/api/plants/:id', protect, async (req, res) => {
    try {
        const plant = await Plant.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        
        if (!plant) {
            return res.status(404).json({ error: "The plant was not found or you do not have permission to delete it." });
        }
        
        res.status(200).json({ message: "Plant deleted successfully!" });
    } catch (error) {
        res.status(500).json({ error: "Error deleting plant" });
    }
});


app.listen(PORT, () => {
    console.log(`🚀 Hybrid server running on http://172.20.10.4:${PORT}`);
});