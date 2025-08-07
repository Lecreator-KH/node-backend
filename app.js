const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('Hello from Node.js!');
});

app.get('/about', (req, res) => {
    res.send('This API is created by Kevin!');
});

let restaurants = [
    { id: 1, name: "Pizza Palace", cuisine: "Italian", rating: 4.5 },
    { id: 2, name: "Sushi Central", cuisine: "Japanese", rating: 4.8 }
];

app.get('/restaurants', (req, res) => {
    res.json(restaurants);
});

app.get('/restaurants/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const rest = restaurants.find(r => r.id === id);
    if (!rest) {
        return res.status(404).json({ error: "Restaurant not found" });
    }
    res.json(rest);
});

app.use(express.json());
let nextId = 3;
app.post('/restaurants', (req, res) => {
    const { name, cuisine, rating } = req.body;
    if (!name || !cuisine || typeof rating !== 'number') {
        return res.status(400).json({ error: "name, cuisine, and numeric rating are required" });
    }
    const newRest = { id: nextId++, name, cuisine, rating };
    restaurants.push(newRest);
    res.status(201).json(newRest);
});

app.delete('/restaurants/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const idx = restaurants.findIndex(r => r.id === id);
    if (idx === -1) {
        return res.status(404).json({ error: "Restaurant not found" });
    }
    const removed = restaurants.splice(idx, 1)[0];
    res.json(removed);
});

app.put('/restaurants/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const rest = restaurants.find(r => r.id === id);
    if (!rest) {
        return res.status(404).json({ error: "Restaurant not found" });
    }
    // Merge updates; allow partial updates
    const { name, cuisine, rating } = req.body;
    if (name) rest.name = name;
    if (cuisine) rest.cuisine = cuisine;
    if (rating !== undefined) rest.rating = rating; res.json(rest);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
