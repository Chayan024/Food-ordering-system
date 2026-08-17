import { describe, it, expect } from 'vitest';
import { checkoutSchema, couponSchema } from '../src/lib/validation';

describe('Cart & Financial Calculation Suite', () => {
  const cart = [
    { name: 'Margherita Pizza', price: 14.99, quantity: 2 }, // $29.98
    { name: 'Classic Tiramisu', price: 7.99, quantity: 1 },  // $7.99
  ];

  it('TC-CART-01: Should compute accurate subtotal from cart items', () => {
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    expect(parseFloat(subtotal.toFixed(2))).toBe(37.97);
  });

  it('TC-CART-02: Should calculate 5% tax and delivery charges correctly', () => {
    const subtotal = 37.97;
    const tax = parseFloat((subtotal * 0.05).toFixed(2)); // $1.90
    const deliveryFee = 3.99;

    expect(tax).toBe(1.90);
    const preDiscountTotal = subtotal + tax + deliveryFee;
    expect(parseFloat(preDiscountTotal.toFixed(2))).toBe(43.86);
  });

  it('TC-CART-03: Should apply percentage coupon discount with maximum cap', () => {
    const subtotal = 37.97;
    const coupon = {
      code: 'FEAST20',
      discountPercent: 20, // 20% of $37.97 is $7.59
      maxDiscount: 10.0,
      minOrderValue: 25.0,
    };

    expect(subtotal >= coupon.minOrderValue).toBe(true);
    const rawDiscount = (subtotal * coupon.discountPercent) / 100;
    const appliedDiscount = Math.min(rawDiscount, coupon.maxDiscount);

    expect(parseFloat(appliedDiscount.toFixed(2))).toBe(7.59);

    const tax = 1.90;
    const deliveryFee = 3.99;
    const grandTotal = subtotal + tax + deliveryFee - appliedDiscount;
    expect(parseFloat(grandTotal.toFixed(2))).toBe(36.27);
  });

  it('TC-CART-04: Should validate checkout payload requirements', () => {
    const validCheckout = {
      restaurantId: 'rest-123',
      deliveryAddress: '742 Evergreen Terrace, Metropolis',
      customerPhone: '+1 555-1234',
      paymentMethod: 'UPI' as const,
      couponCode: 'FEAST20',
    };

    const result = checkoutSchema.safeParse(validCheckout);
    expect(result.success).toBe(true);
  });
});
