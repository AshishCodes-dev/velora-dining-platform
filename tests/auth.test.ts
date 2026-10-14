import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createExpressApp } from '../server.ts';

const app = createExpressApp();

describe('Auth API (Register & Login)', () => {
  const uniqueEmail = `testuser_${Date.now()}@example.com`;

  it('successfully registers a new guest customer', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Guest',
        email: uniqueEmail,
        phone: '+1 (415) 555-0199',
        password: 'ValidPassword123!',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(uniqueEmail.toLowerCase());
    expect(res.body.user.role).toBe('CUSTOMER');
  });

  it('rejects registration with duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Duplicate User',
        email: uniqueEmail,
        phone: '+1 (415) 555-0199',
        password: 'ValidPassword123!',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('successfully logs in with valid credentials and returns signed JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: uniqueEmail,
        password: 'ValidPassword123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(typeof res.body.token).toBe('string');
  });

  it('rejects login with invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: uniqueEmail,
        password: 'WrongPassword999!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
