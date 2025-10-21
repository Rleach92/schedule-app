// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // 1. Load environment variables from .env file

const app = express();
app.use(express.json());
app.use(cors());

// --- Database Connection ---
// 2. Use the variable from .env
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
      console.error("MongoDB Connection Error:", err);
      process.exit(1); // Exit if DB connection fails
  });

// --- Define API Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/schedules', require('./routes/schedules'));
app.use('/api/calendar-events', require('./routes/calendarEvents'));
app.use('/api/pto', require('./routes/pto'));
app.use('/api/swaps', require('./routes/swaps'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/users', require('./routes/users'));


// 3. Use dynamic port from environment or default to 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));