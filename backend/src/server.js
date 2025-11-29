const express = require('express');
const cors = require('cors');
const formRoutes = require('./routes/formRoutes');

const app = express();

// Initialize DB connection
require('./config/database');

// --- Middleware ---
app.use(cors()); // Allow all origins for Vercel
app.use(express.json());

// --- Routes ---
app.use('/api', formRoutes);

// Export app for Vercel
module.exports = app;

// Only listen if running locally (not in Vercel)
if (require.main === module) {
    const PORT = 3001;
    app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
}