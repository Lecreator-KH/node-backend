const request = require('supertest');
const app = require('./app'); // Your Express app
const { Pool } = require('pg');
// Create a pool for testing.
// In a real-world scenario, you might use a separate test database.
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'restaurants_db',
    password: 'your_password',
    port: 5432,
});
// Jest hooks to manage the test lifecycle
beforeAll(() => {
    // This runs once before all tests
});
afterAll(async () => {
    // This runs once after all tests have finished
    // We close the database connection to allow Jest to exit gracefully.
    await pool.end();
});
beforeEach(async () => {
    // This runs before each individual test
    // We clean the table and seed it with known data for a predictable state.
    await pool.query('TRUNCATE TABLE restaurants RESTART IDENTITY');
    await pool.query(
        `INSERT INTO restaurants (name, cuisine, rating) VALUES
('Testaurant', 'Test Cuisine', 4.0),
('Another Test Place', 'Test Food', 3.5)`
    );
});
// Main test suite
describe('Restaurant API', () => {
    // Test cases will go here
    // Inside the describe(...) block in app.test.js
    describe('GET /restaurants', () => {
        it('should return all restaurants', async () => {
            const response = await request(app).get('/restaurants');
            expect(response.statusCode).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body.length).toBe(2);
            expect(response.body[0].name).toBe('Testaurant');
        });
    });
    describe('GET /restaurants/:id', () => {
        it('should return a specific restaurant', async () => {
            const response = await request(app).get('/restaurants/1');
            expect(response.statusCode).toBe(200);
            expect(response.body.name).toBe('Testaurant');
        });
        it('should return 404 if the restaurant is not found', async () => {
            const response = await
                request(app).get('/restaurants/999');
            expect(response.statusCode).toBe(404);
        });
    });
    describe('POST /restaurants', () => {
        it('should create a new restaurant', async () => {
            const newRestaurant = {
                name: 'Brand New Cafe',
                cuisine: 'Coffee & Pastries',
                rating: 4.9
            };
            const response = await request(app)
                .post('/restaurants')
                .send(newRestaurant);
            expect(response.statusCode).toBe(201);
            expect(response.body.id).toBe(3); // 1 and 2 were seeded
            expect(response.body.name).toBe('Brand New Cafe');
        });
    });
    describe('PUT /restaurants/:id', () => {
        it('should update an existing restaurant', async () => {
            const updatedData = {
                name: 'Testaurant Updated',
                cuisine: 'New Cuisine',
                rating: 5.0
            };
            const response = await request(app)
                .put('/restaurants/1')
                .send(updatedData);
            expect(response.statusCode).toBe(200);
            expect(response.body.name).toBe('Testaurant Updated');
            expect(response.body.rating).toBe('5.0'); // DECIMAL type can return as string
        });
    });
    describe('DELETE /restaurants/:id', () => {
        it('should delete a restaurant', async () => {
            const response = await
                request(app).delete('/restaurants/1');
            expect(response.statusCode).toBe(200);
            expect(response.body.name).toBe('Testaurant'); // Check that the deleted item is returned
            // Verify it's actually gone
            const verifyResponse = await
                request(app).get('/restaurants/1');
            expect(verifyResponse.statusCode).toBe(404);
        });
    });
});