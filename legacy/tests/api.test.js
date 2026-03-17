const request = require('supertest');
const app = require('../server');

describe('Zenca Gamers API Tests', () => {
    describe('Health Check', () => {
        it('should return server health status', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Server is healthy');
        });
    });

    describe('Authentication', () => {
        it('should register a new user', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'password123',
                    firstName: 'Test',
                    lastName: 'User'
                })
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.user.username).toBe('testuser');
        });

        it('should login user', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.token).toBeDefined();
        });
    });

    describe('Products', () => {
        it('should get all products', async () => {
            const response = await request(app)
                .get('/api/products')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data.products)).toBe(true);
        });

        it('should get product categories', async () => {
            const response = await request(app)
                .get('/api/products/categories')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data.categories)).toBe(true);
        });
    });

    describe('Messages', () => {
        it('should submit contact message', async () => {
            const response = await request(app)
                .post('/api/messages')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    subject: 'Test Message',
                    message: 'This is a test message'
                })
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.messageId).toBeDefined();
        });
    });
});