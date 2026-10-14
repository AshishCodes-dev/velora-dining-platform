import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createExpressApp } from '../server.ts';

const app = createExpressApp();

describe('Reservation Cancellation & Status Permissions', () => {
  let customerToken = '';
  let otherCustomerToken = '';
  let staffToken = '';
  let reservationId = '';

  beforeAll(async () => {
    // 1. Primary customer (fresh user to avoid conflict with existing reservations)
    const uniqueEmail = `cust_resv_${Date.now()}@example.com`;
    const custRes = await request(app).post('/api/auth/register').send({
      name: 'Reservation Owner',
      email: uniqueEmail,
      phone: '+1 (415) 555-0822',
      password: 'Password123!',
    });
    customerToken = custRes.body.token;

    // 2. Secondary customer
    const otherRes = await request(app).post('/api/auth/register').send({
      name: 'Reservation Test User',
      email: `resv_other_${Date.now()}@example.com`,
      phone: '+1 (415) 555-0999',
      password: 'Password123!',
    });
    otherCustomerToken = otherRes.body.token;

    // 3. Staff login
    const staffRes = await request(app).post('/api/auth/login').send({
      email: 'staff@velora.com',
      password: 'staff123',
    });
    staffToken = staffRes.body.token;

    // 4. Create a booking for primary customer
    const resvRes = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        date: '2026-11-20',
        time: '19:30',
        guests: 2,
        tableArea: 'Velvet Chef Counter',
        name: 'Reservation Owner',
        phone: '+1 (415) 555-0822',
        email: uniqueEmail,
        specialRequest: 'Window seating please',
      });

    reservationId = resvRes.body.reservation?.id;
  });

  it('rejects unauthenticated GET /api/reservations', async () => {
    const res = await request(app).get('/api/reservations');
    expect(res.status).toBe(401);
  });

  it('forbids CUSTOMER from marking reservation as CONFIRMED', async () => {
    const res = await request(app)
      .patch(`/api/reservations/${reservationId}/status`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ status: 'CONFIRMED' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('forbids another customer from modifying this reservation', async () => {
    const res = await request(app)
      .patch(`/api/reservations/${reservationId}/status`)
      .set('Authorization', `Bearer ${otherCustomerToken}`)
      .send({ status: 'CANCELLED' });

    expect(res.status).toBe(403);
  });

  it('allows owner CUSTOMER to CANCEL their own reservation', async () => {
    const res = await request(app)
      .patch(`/api/reservations/${reservationId}/status`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ status: 'CANCELLED' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.reservation.status).toBe('CANCELLED');
  });

  it('allows STAFF to update reservation status to CONFIRMED or REJECTED', async () => {
    const res = await request(app)
      .patch(`/api/reservations/${reservationId}/status`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ status: 'CONFIRMED' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.reservation.status).toBe('CONFIRMED');
  });
});
