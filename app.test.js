const request = require('supertest');
const app = require('./app'); // Your Express app
const { Pool } = require('pg');

// DB pool config with environment variable fallbacks for local testing
const pool = new Pool({
  user: process.env.PG_USER || 'postgres',
  host: process.env.PG_HOST || 'localhost',
  database: process.env.PG_DATABASE || 'restaurants_db',
  password: process.env.PG_PASSWORD || '123',
  port: parseInt(process.env.PG_PORT || '5432'),
});

beforeAll(async () => {
  // Ensure the restaurants table exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS restaurants (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      cuisine VARCHAR(50),
      rating DECIMAL(2, 1)
    );
  `);
});

beforeEach(async () => {
  // Reset table and seed data before each test
  await pool.query('TRUNCATE TABLE restaurants RESTART IDENTITY CASCADE');
  await pool.query(`
    INSERT INTO restaurants (name, cuisine, rating)
    VALUES 
      ('Testaurant', 'Test Cuisine', 4.0),
      ('Mock Bistro', 'Mock Cuisine', 4.2);
  `);
});

afterAll(async () => {
  // Close DB connection
  await pool.end();
});

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
    const response = await request(app).get('/restaurants/999');
    expect(response.statusCode).toBe(404);
  });
});

describe('POST /restaurants', () => {
  it('should create a new restaurant', async () => {
    const newRestaurant = {
      name: 'Brand New Cafe',
      cuisine: 'Coffee & Pastries',
      rating: 4.9,
    };
    const response = await request(app)
      .post('/restaurants')
      .send(newRestaurant);

    expect(response.statusCode).toBe(201);
    expect(response.body.id).toBe(3); // IDs 1 and 2 are seeded
    expect(response.body.name).toBe('Brand New Cafe');
  });
});

describe('PUT /restaurants/:id', () => {
  it('should update an existing restaurant', async () => {
    const updatedData = {
      name: 'Testaurant Updated',
      cuisine: 'New Cuisine',
      rating: 5.0,
    };
    const response = await request(app)
      .put('/restaurants/1')
      .send(updatedData);

    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe('Testaurant Updated');
    expect(response.body.rating).toBe('5.0');
  });
});

describe('DELETE /restaurants/:id', () => {
  it('should delete a restaurant', async () => {
    const response = await request(app).delete('/restaurants/1');
    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe('Testaurant');

    // Verify deletion
    const verifyResponse = await request(app).get('/restaurants/1');
    expect(verifyResponse.statusCode).toBe(404);
  });
});
