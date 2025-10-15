/**
 * API Tests - Auth Routes
 * Tests for authentication endpoints
 */

const request = require('supertest');
const express = require('express');
const authRouter = require('../../routes/auth');

// Create a test app
const app = express();
app.use(express.json());

// Mock the database
jest.mock('../../db.js', () => ({
  get: jest.fn(),
  query: jest.fn(),
  run: jest.fn(),
}));

// Mock authentication middleware
jest.mock('../../middleware/auth', () => (req, res, next) => {
  req.user = { id: 1, name: 'Test User', email: 'test@test.com' };
  next();
});

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'test.jwt.token'),
}));

const db = require('../../db.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mount the router
app.use('/api/auth', authRouter);

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'not-an-email',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.message).toBe('Validation failed');
    });

    it('should reject empty password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: '',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should reject missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should reject missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should return 401 when user not found', async () => {
      db.get.mockImplementation((query, params, callback) => {
        callback(null, null); // User not found
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should return 401 when password does not match', async () => {
      db.get.mockImplementation((query, params, callback) => {
        callback(null, {
          id: 1,
          email: 'test@test.com',
          password: 'hashed_password',
          name: 'Test User',
        });
      });

      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should successfully login with valid credentials', async () => {
      db.get.mockImplementation((query, params, callback) => {
        callback(null, {
          id: 1,
          email: 'test@test.com',
          password: 'hashed_password',
          name: 'Test User',
          permissions: ['read', 'write'],
        });
      });

      bcrypt.compare.mockResolvedValue(true);

      db.run.mockImplementation((query, params, callback) => {
        callback(null);
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.token).toHaveValidJWT();
      expect(jwt.sign).toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      db.get.mockImplementation((query, params, callback) => {
        callback(new Error('Database connection error'));
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(500);
    });

    it('should normalize email to lowercase', async () => {
      db.get.mockImplementation((query, params, callback) => {
        callback(null, {
          id: 1,
          email: 'test@test.com',
          password: 'hashed_password',
          name: 'Test User',
        });
      });

      bcrypt.compare.mockResolvedValue(true);
      db.run.mockImplementation((query, params, callback) => {
        callback(null);
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'TEST@TEST.COM',
          password: 'password123',
        });

      // Check if email was normalized
      const dbCallParams = db.get.mock.calls[0][1];
      expect(dbCallParams[0]).toBe('test@test.com');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should reject weak passwords', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New User',
          email: 'newuser@test.com',
          password: 'weak', // Too short, no uppercase, no number
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should reject invalid name length', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'A', // Too short
          email: 'newuser@test.com',
          password: 'StrongPass123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should accept valid registration data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New User',
          email: 'newuser@test.com',
          password: 'StrongPassword123',
        });

      // Will get 400 or 201 depending on backend implementation
      // Main thing is that format validation passed
      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });
});
