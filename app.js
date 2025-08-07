const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('Hello from Node.js!');
});

app.get('/about', (req, res) => {
    res.send('This API is created by Kevin!');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
