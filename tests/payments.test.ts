import { describe, it, expect } from 'vitest';
import { processPayment } from '../src/lib/payment-gateway';

describe('Payment Gateway Integration & Failure Handling Suite', () => {
  it('TC-PAY-01: Should process successful UPI payment and generate transaction ID', async () => {
    const result = await processPayment({
      orderId: 'ORD-TEST-01',
      amount: 35.50,
      method: 'UPI',
      upiId: 'customer@okaxis',
    });

    expect(result.success).toBe(true);
    expect(result.transactionId.startsWith('TXN_')).toBe(true);
    expect(result.gatewayResponse.status).toBe('SUCCESS');
    expect(result.gatewayResponse.method).toBe('UPI');
  });

  it('TC-PAY-02: Should detect payment failure without charging on bank decline', async () => {
    const result = await processPayment({
      orderId: 'ORD-TEST-FAIL',
      amount: 35.50,
      method: 'UPI',
      upiId: 'declined_fail@bank',
    });

    expect(result.success).toBe(false);
    expect(result.gatewayResponse.status).toBe('FAILED');
    expect(result.gatewayResponse.errorCode).toBe('UPI_BANK_DECLINE');
  });

  it('TC-PAY-03: Should process Cash on Delivery (COD) successfully', async () => {
    const result = await processPayment({
      orderId: 'ORD-TEST-COD',
      amount: 42.00,
      method: 'COD',
    });

    expect(result.success).toBe(true);
    expect(result.gatewayResponse.method).toBe('COD');
  });

  it('TC-PAY-04: Should process Card payment and handle declining card numbers', async () => {
    const successCard = await processPayment({
      orderId: 'ORD-TEST-CARD',
      amount: 25.00,
      method: 'CARD',
      cardNumber: '4532 8899 1234 5678',
    });
    expect(successCard.success).toBe(true);

    const failCard = await processPayment({
      orderId: 'ORD-TEST-CARD-FAIL',
      amount: 25.00,
      method: 'CARD',
      cardNumber: '4532 0000 0000 0000',
    });
    expect(failCard.success).toBe(false);
    expect(failCard.gatewayResponse.errorCode).toBe('CARD_INSUFFICIENT_FUNDS');
  });
});
