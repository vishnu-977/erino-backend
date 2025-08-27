const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
dotenv.config();
const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');
const app = express();
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
const PORT = process.env.PORT || 8080;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
  app.listen(PORT, () => {
    console.log('Server running on port', PORT);
  });
}).catch(err => {
  console.error('DB connection error', err);
  process.exit(1);
});
