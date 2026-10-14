import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createExpressApp } from '../server.ts';

const app = createExpressApp();

describe('Order Ownership & Access Security', () => {
  let customerToken = '';
  let otherCustomerToken = '';
  let staffToken = '';
  let customerOrderNumber = '';

  beforeAll(async () => {
    // 1. Login primary customer (Elena)
    const custRes = await request(app).post('/api/auth/login').send({
      email: 'elena@example.com',
      password: 'customer123',
    });
    customerToken = custRes.body.token;

    // 2. Register secondary customer
    const otherRes = await request(app).post('/api/auth/register').send({
      name: 'Second Customer',
      email: `second_${Date.now()}@example.com`,
      phone: '+1 (415) 555-0811',
      password: 'Password123!',
    });
    otherCustomerToken = otherRes.body.token;

    // 3. Staff token
    const staffRes = await request(app).post('/api/auth/login').send({
      email: 'staff@velora.com',
      password: 'staff123',
    });
    staffToken = staffRes.body.token;

    // 4. Create an order as primary customer
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        customerName: 'Elena Rostova',
        customerPhone: '+1 (415) 602-8819',
        customerEmail: 'elena@example.com',
        items: [
          {
            foodId: 'food-1',
            foodName: 'A5 Wagyu & Saffron Lobster Tasting Platter',
            foodImage: '/images/hero_signature_platter.webp',
            selectedSize: 'Regular',
            selectedAddons: [],
            quantity: 1,
            unitFinalPrice: 48.6,
          },
        ],
        subtotal: 48.6,
        discountAmount: 0,
        deliveryFee: 6,
        taxAmount: 4.37,
        grandTotal: 58.97,
        orderType: 'Delivery',
        deliveryAddress: {
          id: 'addr-1',
          label: 'Residence',
          houseFlat: 'Apt 1204',
          street: '201 Folsom St',
          area: 'Rincon Hill',
          city: 'San Francisco',
          state: 'CA',
          pincode: '94105',
        },
        paymentMethod: 'Card (Test Mode)',
      });

    customerOrderNumber = orderRes.body.order.orderNumber;
  });

  it('rejects unauthenticated GET /api/orders without credentials', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(401);
  });

  it('allows owner to fetch their own order by orderNumber', async () => {
    const res = await request(app)
      .get(`/api/orders/${customerOrderNumber}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.order.orderNumber).toBe(customerOrderNumber);
  });

  it('forbids another customer from fetching an order they do not own', async () => {
    const res = await request(app)
      .get(`/api/orders/${customerOrderNumber}`)
      .set('Authorization', `Bearer ${otherCustomerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('allows STAFF to fetch any order by orderNumber', async () => {
    const res = await request(app)
      .get(`/api/orders/${customerOrderNumber}`)
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('allows guest lookup when BOTH orderNumber and matching customer email are provided', async () => {
    const res = await request(app)
      .get(`/api/orders/${customerOrderNumber}?email=elena@example.com`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('rejects guest lookup with wrong email', async () => {
    const res = await request(app)
      .get(`/api/orders/${customerOrderNumber}?email=wrong@example.com`);

    expect(res.status).toBe(403);
  });
});
