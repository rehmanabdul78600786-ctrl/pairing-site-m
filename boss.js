const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require("body-parser");
const cors = require("cors");
const PORT = process.env.PORT || 8000;

const server = require('./qr'); // QR module
const code = require('./pair'); // Pairing code module

require('events').EventEmitter.defaultMaxListeners = 500;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/qr', server);
app.use('/code', code);

app.get('/pair', (req, res) => {
    res.sendFile(path.join(__dirname, 'pair.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'main.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`
Don't Forget To Give Star
Server running on http://localhost:${PORT}`);
});

module.exports = app;
