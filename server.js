const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// ===== CORS Setup =====
const clientUrl = process.env.CLIENT_URL?.trim();
if (!clientUrl) {
  console.warn("CLIENT_URL is not defined! Allowing all origins temporarily.");
}

app.use(cors({
  origin: clientUrl || "*",   // allow frontend or all for testing
  credentials: true
}));

// ===== Middleware =====
app.use(express.json());
app.use(cookieParser());

// ===== Root test route =====
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// ===== API Routes =====
const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);

// ===== MongoDB Connection & Server Start =====
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error("MongoDB connection error:", err));
