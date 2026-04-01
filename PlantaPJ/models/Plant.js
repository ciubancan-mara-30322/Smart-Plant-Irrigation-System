const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    moisture: { type: Number, default: 0 },
    temperature: { type: Number, default: 0 },
    humidity: { type: Number, default: 0 },
    status: { type: String, default: "Healthy" },
    isPumpOn: { type: Boolean, default: false },
    flowLevel: { type: Number, default: 3 },
    
    // Legătura cu posesorul - va deveni Required după ce facem Login-ul
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: false // Îl lăsăm false până testăm Login-ul
    },

    // PENTRU STATISTICI: Salvăm ultimele 7 udări (exemplu)
    wateringHistory: [{
        date: { type: Date, default: Date.now },
        durationSeconds: Number
    }],

    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Plant', plantSchema, 'Plants');