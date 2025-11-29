const express = require('express');
const {
    getFormSchema,
    createSubmission,
    getSubmissions
} = require('../controllers/formController');

const router = express.Router();

router.get('/form-schema', getFormSchema);
router.post('/submissions', createSubmission);
router.get('/submissions', getSubmissions);

module.exports = router;

