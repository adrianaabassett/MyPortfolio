const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.static('public'));

// Sanitization function: removes control characters, HTML tags, and dangerous symbols
function sanitizeInput(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/<[^>]*>/g, '')                  // Remove HTML tags / script tags
        .replace(/[\r\n\t]/g, ' ')               // Replace newlines/tabs with spaces to keep single-line formatting
        .replace(/[^\w\s@.,?!'()-]/gi, '')       // Keep only alphanumeric characters, spaces, and basic safe punctuation
        .trim();
}

app.post('/api/submit-builder', (req, res) => {
    const { name, email, about } = req.body;

    // Validate existence
    if (!name || !email || !about) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // Sanitize inputs
    const safeName = sanitizeInput(name);
    const safeEmail = sanitizeInput(email);
    const safeAbout = sanitizeInput(about);

    // Basic email pattern check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(safeEmail)) {
        return res.status(400).json({ error: 'Invalid email address.' });
    }

    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] Name: ${safeName} | Email: ${safeEmail} | About: ${safeAbout}\n`;

    // File path where submissions are saved
    const filePath = path.join(__dirname, 'ListOfPeopleSubmitted.txt');

    // Securely append to file
    fs.appendFile(filePath, entry, 'utf8', (err) => {
        if (err) {
            console.error('Failed to write submission:', err);
            return res.status(500).json({ error: 'Internal server error.' });
        }
        res.status(200).json({ message: 'Submission saved successfully!' });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});