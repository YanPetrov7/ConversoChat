/* eslint-disable */

const request = require('supertest');
const routes = require('../src/js/routes.js');
const express = require('express');
const session = require('express-session');
const { User } = require('../models');
const bcrypt = require('bcrypt');
const { sequelize } = require('../models')

const app = express();

app.use(
  session({
    secret: 'secretkey',
    resave: true,
    saveUninitialized: true
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', routes);

// Middleware setup
app.use(
  session({
    secret: 'secretkey',
    resave: true,
    saveUninitialized: true
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', routes);

afterAll(async () => {
  await sequelize.close();
});

// Run after each test case in this suite
afterEach(async () => {
  // Remove all users from the database
  await User.destroy({ where: {} });
});

// Test suite for the 'userController'
describe('userController', () => {

  // Test suite for the 'login' function
  describe('login', () => {
    // Test case: Should send an error message if username or password is missing
    test('should send an error message if username or password is missing', async () => {
      const response = await request(app).post('/login').send({});
  
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('Please enter both Username and Password!');
    });
  
    // Test case: Should send an error message if no user with such name
    test('should send an error message if no user with such name', async () => {
      const response = await request(app).post('/login').send({ username: 'test1', password: 'test' });
  
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe(`No user with name: 'test1'`);
    });
  
    // Test case: Should send an error message if user password is wrong
    test('should send an error message if user password is wrong', async () => {
      // Create a test user with a hashed password in the database
      const hash = await bcrypt.hash('testPassword', 10);
      await User.create({ username: 'test', password: hash });
  
      const response = await request(app).post('/login').send({ username: 'test', password: 'wrongPassword' });
  
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe(`Invalid password for User: 'test'`);
    });
  
    // Test case: Should redirect to the home page if login and password are correct
    test('should redirect to the home page if login and password are correct', async () => {
      // Create a test user with a hashed password in the database
      const hash = await bcrypt.hash('testPassword', 10);
      await User.create({ username: 'test', password: hash });
  
      const response = await request(app).post('/login').send({ username: 'test', password: 'testPassword' });
  
      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe(`/home?user=test`);
    });
  });
  
  // Test suite for the 'register' function
  describe('register', () => {
    // Test case: Should send an error message if username or password is missing
    test('should send an error message if username or password is missing', async () => {
      const response = await request(app).post('/register').send({});
  
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('Please enter username, password and repeated password!');
    });
  
    // Test case: Should send an error message if username is not valid
    test('should send an error message if username is not valid', async () => {
      const response = await request(app).post('/register').send({ 
        username: 'test', 
        password: 'testPassword1',
        repeatedPassword: 'testPassword1'
      });
  
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('Username length should be: at least 5 characters, contain only Latin letters and numbers');
    });
  
    // Test case: Should send an error message if password is not valid
    test('should send an error message if password is not valid', async () => {
      const response = await request(app).post('/register').send({ 
        username: 'testUser', 
        password: '1234',
        repeatedPassword: '1234'
      });
  
      expect(response.statusCode).toBe(402);
      expect(response.text).toBe('Password length should be: at least 8 characters, include a combination of uppercase and lowercase letters, contain only Latin letters and numbers.');
    });
  
    // Test case: Should send an error message if password is not equal to the repeated password
    test('should send an error message if password is not equal to the repeated password', async () => {
      const response = await request(app).post('/register').send({ 
        username: 'testUser', 
        password: 'testPassword1',
        repeatedPassword: 'testPassword12'
      });
  
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('Password is not equal to the repeated password');
    });
  
    // Test case: Should send an error message if username is already taken
    test('should send an error message if username is already taken', async () => {
      const firstResponse = await request(app).post('/register').send({ 
        username: 'testUser', 
        password: 'testPassword1',
        repeatedPassword: 'testPassword1'
      });
  
      const secondResponse = await request(app).post('/register').send({ 
        username: 'testUser', 
        password: 'testPassword1',
        repeatedPassword: 'testPassword1'
      });
  
      expect(secondResponse.statusCode).toBe(404);
      expect(secondResponse.text).toBe(`User with username: 'testUser' already exists`);
    });
  
    // Test case: Should redirect to the home page if the user is created
    test('should redirect to the home page if the user is created', async () => {
      const response = await request(app).post('/register').send({ 
        username: 'testUser', 
        password: 'testPassword1',
        repeatedPassword: 'testPassword1'
      });
  
      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe(`/home?user=testUser`);
    });
  });

  describe('logout', () => {
    test('should redirect to the welcome page after logging out', async () => {
      await request(app).post('/logout').send({});
  
      // Perform logout request
      const response = await request(app).get('/logout');
  
      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe('/');
    });
  });
});
