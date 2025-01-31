// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectdb = require("./config/db");

// const errorHandler = require("./middleware/Errorhandler.js");
// Load environment variables
dotenv.config();
connectdb();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/papers', require('./routes/papers'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
