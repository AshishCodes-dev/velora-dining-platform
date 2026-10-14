import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createExpressApp } from '../server.ts';

const app = createExpressApp();

describe('Coupon Validation API', () => {
  it('applies percentage coupon WELCOME10 successfully when subtotal meets minimum', async () => {
    const res = await request(app)
      .post('/api/coupons/apply')
      .send({
        code: 'WELCOME10',
        subtotal: 50,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.coupon.code).toBe('WELCOME10');
    // 10% of 50 = 5.00
    expect(res.body.discountAmount).toBe(5);
  });

  it('caps discount amount at maxDiscountAmount', async () => {
    // WELCOME10 has maxDiscountAmount = 25
    // 10% of 300 = 30, capped at 25
    const res = await request(app)
      .post('/api/coupons/apply')
      .send({
        code: 'WELCOME10',
        subtotal: 300,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.discountAmount).toBe(25);
  });

  it('applies fixed-discount coupon FIRSTORDER correctly', async () => {
    const res = await request(app)
      .post('/api/coupons/apply')
      .send({
        code: 'FIRSTORDER',
        subtotal: 60,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.discountAmount).toBe(15);
  });

  it('rejects coupon when subtotal is below minimum order requirement', async () => {
    // FIRSTORDER requires minOrderValue: 50
    const res = await request(app)
      .post('/api/coupons/apply')
      .send({
        code: 'FIRSTORDER',
        subtotal: 35,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Minimum order');
  });

  it('returns 404 for non-existent coupon code', async () => {
    const res = await request(app)
      .post('/api/coupons/apply')
      .send({
        code: 'NONEXISTENT999',
        subtotal: 100,
      });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 for empty coupon code', async () => {
    const res = await request(app)
      .post('/api/coupons/apply')
      .send({
        code: '',
        subtotal: 100,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
