const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// ✅ CORS setup (safe)
const clientUrl = process.env.CLIENT_URL?.trim(); // remove extra spaces/newlines
if (!clientUrl) {
  console.warn("CLIENT_URL is not defined! Allowing all origins temporarily.");
}

app.use(cors({
  origin: clientUrl || "*",  // allow your frontend or all for safety
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Routes
const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);

// MongoDB + server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error("MongoDB connection error:", err));
