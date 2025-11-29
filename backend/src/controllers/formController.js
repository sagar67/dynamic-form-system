const crypto = require('crypto');
const schemaConfig = require('../../data/schema.json');
const { dbRun, dbGet, dbAll } = require('../config/database');
const { createValidator } = require('../validation/formValidator');

const getFormSchema = (req, res) => {
    res.json(schemaConfig);
};

const createSubmission = async (req, res) => {
    try {
        const validator = createValidator();
        const validatedData = validator.parse(req.body);

        // Convert Dates to ISO strings for consistent storage
        Object.keys(validatedData).forEach((key) => {
            if (validatedData[key] instanceof Date) {
                validatedData[key] = validatedData[key].toISOString();
            }
        });

        const id = crypto.randomUUID();
        const createdAt = new Date().toISOString();

        await dbRun(
            'INSERT INTO submissions (id, data, createdAt) VALUES (?, ?, ?)',
            [id, JSON.stringify(validatedData), createdAt]
        );

        res.status(201).json({ success: true, id });
    } catch (err) {
        if (err.errors) { // Zod validation error
            return res.status(400).json({ error: "Validation failed", details: err.flatten().fieldErrors });
        }
        console.error("Submission error:", err);
        res.status(500).json({ error: "An internal server error occurred." });
    }
};

const getSubmissions = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortOrder = req.query.sortOrder === 'asc' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    try {
        const countResult = await dbGet('SELECT COUNT(*) as count FROM submissions');
        const total = countResult.count;

        const rows = await dbAll(
            `SELECT * FROM submissions ORDER BY createdAt ${sortOrder} LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        const data = rows.map(row => ({
            ...row,
            data: JSON.parse(row.data)
        }));

        res.json({
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (err) {
        console.error("Error fetching submissions:", err);
        res.status(500).json({ error: "Failed to retrieve submissions from the database." });
    }
};

module.exports = {
    getFormSchema,
    createSubmission,
    getSubmissions,
};
