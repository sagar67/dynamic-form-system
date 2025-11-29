const express = require('express');
const cors = require('cors');
const formRoutes = require('./routes/formRoutes');

const app = express();
const PORT = 3001;

// Initialize DB connection
require('./config/database');

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Routes ---
app.use('/api', formRoutes);

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));