import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createExpressApp } from '../server.ts';

const app = createExpressApp();

describe('Server-Authoritative Price Calculation API', () => {
  it('ignores client-tampered pricing and computes subtotal and grandTotal authoritatively', async () => {
    // food-6 base price is 26, discountPercent is 0
    const res = await request(app)
      .post('/api/orders')
      .send({
        customerName: 'Tamper Tester',
        customerEmail: 'tamper@example.com',
        customerPhone: '+1 (415) 555-0144',
        orderType: 'Pickup',
        paymentMethod: 'Pay at Restaurant / COD',
        // Attempting to send fraudulent prices from the client
        basePrice: 1.0,
        unitFinalPrice: 1.0,
        grandTotal: 1.0,
        subtotal: 1.0,
        items: [
          {
            foodId: 'food-6',
            quantity: 1,
            selectedSize: 'Regular',
            selectedAddons: [],
            // Client attempting to send forged item prices
            unitFinalPrice: 0.5,
            basePrice: 0.5,
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    const order = res.body.order;

    // Server must compute true database price: $26.00
    expect(order.subtotal).toBe(26);
    // Pickup orders have 0 delivery fee
    expect(order.deliveryFee).toBe(0);
    // 9% tax on $26 = 2.34
    expect(order.taxAmount).toBe(2.34);
    // Grand total = 26 + 2.34 = 28.34
    expect(order.grandTotal).toBe(28.34);
    expect(order.items[0].unitFinalPrice).toBe(26);
  });

  it('correctly calculates portion size deltas', async () => {
    // food-6 with Large size (+8) => 26 + 8 = 34
    // quantity 2 => subtotal = 68
    const res = await request(app)
      .post('/api/orders')
      .send({
        customerName: 'Size Tester',
        customerEmail: 'size@example.com',
        customerPhone: '+1 (415) 555-0145',
        orderType: 'Pickup',
        paymentMethod: 'Card (Test Mode)',
        items: [
          {
            foodId: 'food-6',
            quantity: 2,
            selectedSize: 'Large',
            selectedAddons: [],
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    const order = res.body.order;
    expect(order.subtotal).toBe(68);
    expect(order.taxAmount).toBe(6.12); // 9% of 68 = 6.12
    expect(order.grandTotal).toBe(74.12); // 68 + 6.12 = 74.12
  });

  it('correctly calculates verified addon prices and discards invalid addons', async () => {
    // food-6 (26) + addon-truffle (9) = 35
    // fake addon must be filtered out
    const res = await request(app)
      .post('/api/orders')
      .send({
        customerName: 'Addon Tester',
        customerEmail: 'addon@example.com',
        customerPhone: '+1 (415) 555-0146',
        orderType: 'Pickup',
        paymentMethod: 'Card (Test Mode)',
        items: [
          {
            foodId: 'food-6',
            quantity: 1,
            selectedSize: 'Regular',
            selectedAddons: [
              { id: 'addon-truffle' },
              { id: 'fake-addon-exploit' },
            ],
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    const order = res.body.order;
    expect(order.subtotal).toBe(35);
    expect(order.items[0].unitFinalPrice).toBe(35);
    expect(order.items[0].selectedAddons).toHaveLength(1);
    expect(order.items[0].selectedAddons[0].id).toBe('addon-truffle');
  });

  it('correctly calculates item discounts and enforces delivery fee thresholds', async () => {
    // Delivery order under $65 threshold:
    // food-6 (26), delivery fee = $6, tax = 9% of 26 = 2.34
    // grandTotal = 26 + 6 + 2.34 = 34.34
    const resLow = await request(app)
      .post('/api/orders')
      .send({
        customerName: 'Delivery Low',
        customerEmail: 'devlow@example.com',
        customerPhone: '+1 (415) 555-0147',
        orderType: 'Delivery',
        deliveryAddress: {
          houseFlat: 'Apt 1A',
          street: '100 Main St',
          pincode: '94105',
        },
        paymentMethod: 'Card (Test Mode)',
        items: [
          {
            foodId: 'food-6',
            quantity: 1,
            selectedSize: 'Regular',
            selectedAddons: [],
          },
        ],
      });

    expect(resLow.status).toBe(201);
    expect(resLow.body.order.deliveryFee).toBe(6);
    expect(resLow.body.order.grandTotal).toBe(34.34);

    // Delivery order above $65 threshold:
    // food-6 (26) x 3 = 78 subtotal
    // delivery fee = $0, tax = 9% of 78 = 7.02
    // grandTotal = 78 + 0 + 7.02 = 85.02
    const resHigh = await request(app)
      .post('/api/orders')
      .send({
        customerName: 'Delivery High',
        customerEmail: 'devhigh@example.com',
        customerPhone: '+1 (415) 555-0148',
        orderType: 'Delivery',
        deliveryAddress: {
          houseFlat: 'Penthouse 9',
          street: '200 High St',
          pincode: '94105',
        },
        paymentMethod: 'Card (Test Mode)',
        items: [
          {
            foodId: 'food-6',
            quantity: 3,
            selectedSize: 'Regular',
            selectedAddons: [],
          },
        ],
      });

    expect(resHigh.status).toBe(201);
    expect(resHigh.body.order.deliveryFee).toBe(0);
    expect(resHigh.body.order.grandTotal).toBe(85.02);
  });

  it('authoritatively applies coupons and calculates discount on order placement', async () => {
    // food-6 (26) x 2 = 52 subtotal
    // coupon WELCOME10: 10% off of 52 = 5.20 discount
    // netAfterDiscount = 52 - 5.20 = 46.80
    // Pickup => deliveryFee = 0
    // tax = 9% of 46.80 = 4.21
    // grandTotal = 46.80 + 4.21 = 51.01
    const res = await request(app)
      .post('/api/orders')
      .send({
        customerName: 'Coupon Orderer',
        customerEmail: 'couponorder@example.com',
        customerPhone: '+1 (415) 555-0149',
        orderType: 'Pickup',
        paymentMethod: 'Card (Test Mode)',
        couponCode: 'WELCOME10',
        items: [
          {
            foodId: 'food-6',
            quantity: 2,
            selectedSize: 'Regular',
            selectedAddons: [],
          },
        ],
      });

    expect(res.status).toBe(201);
    const order = res.body.order;
    expect(order.subtotal).toBe(52);
    expect(order.discountAmount).toBe(5.2);
    expect(order.couponCode).toBe('WELCOME10');
    expect(order.taxAmount).toBe(4.21);
    expect(order.grandTotal).toBe(51.01);
  });
});
