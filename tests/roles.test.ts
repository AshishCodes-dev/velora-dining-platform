import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createExpressApp } from '../server.ts';

const app = createExpressApp();

describe('Role-Based Access Control (Customer vs Staff vs Admin)', () => {
  let customerToken = '';
  let staffToken = '';
  let adminToken = '';

  beforeAll(async () => {
    // Obtain tokens for all 3 roles from seeded demo accounts
    const custRes = await request(app).post('/api/auth/login').send({
      email: 'elena@example.com',
      password: 'customer123',
    });
    customerToken = custRes.body.token;

    const staffRes = await request(app).post('/api/auth/login').send({
      email: 'staff@velora.com',
      password: 'staff123',
    });
    staffToken = staffRes.body.token;

    const adminRes = await request(app).post('/api/auth/login').send({
      email: 'admin@velora.com',
      password: 'admin123',
    });
    adminToken = adminRes.body.token;
  });

  it('CUSTOMER cannot access admin customer management endpoint', async () => {
    const res = await request(app)
      .get('/api/customers')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('CUSTOMER cannot access admin staff management endpoint', async () => {
    const res = await request(app)
      .get('/api/staff')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
  });

  it('STAFF can view all orders (?all=true)', async () => {
    const res = await request(app)
      .get('/api/orders?all=true')
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.orders)).toBe(true);
  });

  it('STAFF cannot manage staff members (ADMIN only)', async () => {
    const res = await request(app)
      .get('/api/staff')
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(403);
  });

  it('ADMIN can access customer directory and staff members', async () => {
    const resCust = await request(app)
      .get('/api/customers')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(resCust.status).toBe(200);
    expect(resCust.body.success).toBe(true);

    const resStaff = await request(app)
      .get('/api/staff')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(resStaff.status).toBe(200);
    expect(resStaff.body.success).toBe(true);
  });
});
