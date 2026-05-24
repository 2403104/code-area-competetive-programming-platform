require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/admin/auth', require('./routes/auth'));
app.use('/admin/contests', require('./routes/contests'));
app.use('/admin/contests', require('./routes/plageDetector'));
app.use('/admin/problems', require('./routes/problems'));

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log('MongoDB connected');
        app.listen(process.env.PORT || 3003, () => {
            console.log(`Server running on port ${process.env.PORT || 3003}`);
        });
    })
    .catch(err => console.error('MongoDB connection error:', err));
