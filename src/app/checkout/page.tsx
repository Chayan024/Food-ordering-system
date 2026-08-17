'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CreditCard,
  QrCode,
  Banknote,
  Tag,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building2,
  MapPin,
  Phone,
  MessageSquare,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, subtotal, restaurant, clearCart } = useCart();

  // Form states
  const [address, setAddress] = useState(user?.address || '742 Evergreen Terrace, Sector 4, Metropolis');
  const [phone, setPhone] = useState(user?.phone || '+1 (555) 234-5678');
  const [instructions, setInstructions] = useState('Leave at doorstep, please ring bell once');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING' | 'COD'>('UPI');

  // Payment fields
  const [upiId, setUpiId] = useState('alex@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('742');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Processing state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Math Calculations
  const tax = parseFloat((subtotal * 0.05).toFixed(2));
  const deliveryFee = restaurant?.deliveryFee || 3.99;
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = parseFloat(Math.max(0, subtotal + tax + deliveryFee - discount).toFixed(2));

  const applyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    if (!code) return;

    setCouponLoading(true);
    setCouponError('');

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();

      if (!res.ok) {
        setCouponError(data.error || 'Invalid coupon');
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon(data.coupon);
        setCouponCode(code);
        setCouponError('');
      }
    } catch {
      setCouponError('Failed to validate coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          deliveryAddress: address,
          customerPhone: phone,
          paymentMethod,
          couponCode: appliedCoupon?.code,
          specialInstructions: instructions,
          cardNumber,
          cardExpiry,
          cardCvv,
          upiId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Payment or order processing failed');
        setIsSubmitting(false);
        return;
      }

      // Success! Clear cart and redirect to live tracking page
      await clearCart();
      router.push(`/orders/${data.orderId}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error during checkout');
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Your cart is currently empty</h2>
        <p style={{ color: 'var(--text-muted)', margin: '12px 0 24px' }}>
          Add your favorite dishes before proceeding to checkout.
        </p>
        <Link href="/" className="btn btn-primary">
          Browse Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '24px' }}>
          Secure Checkout
        </h1>

        {errorMessage && (
          <div
            style={{
              padding: '14px 18px',
              backgroundColor: 'var(--danger-light)',
              color: 'var(--danger)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: 600,
            }}
          >
            <AlertTriangle size={20} /> {errorMessage}
          </div>
        )}

        <form onSubmit={handlePlaceOrder}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '32px',
              alignItems: 'flex-start',
            }}
          >
            {/* Left Column: Delivery & Payment Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Section 1: Delivery Address */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '8px', borderRadius: '50%' }}>
                    <MapPin size={18} />
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700 }}>1. Delivery Address</h3>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Street Address & Apartment / Landmark</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Flat 4B, Emerald Heights, Park Avenue"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Phone Number for Driver</label>
                  <input
                    type="tel"
                    required
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Delivery Notes / Gate Code (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="e.g. Ring bell, leave package by door"
                  />
                </div>
              </div>

              {/* Section 2: Payment Method */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '8px', borderRadius: '50%' }}>
                    <CreditCard size={18} />
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700 }}>2. Select Payment Method</h3>
                </div>

                {/* Payment Tabs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' }}>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: paymentMethod === 'UPI' ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                      backgroundColor: paymentMethod === 'UPI' ? 'var(--primary-subtle)' : '#ffffff',
                      color: paymentMethod === 'UPI' ? 'var(--primary-hover)' : 'var(--text-main)',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      justifyContent: 'center',
                    }}
                  >
                    <QrCode size={16} /> Instant UPI (GPay/PhonePe)
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: paymentMethod === 'CARD' ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                      backgroundColor: paymentMethod === 'CARD' ? 'var(--primary-subtle)' : '#ffffff',
                      color: paymentMethod === 'CARD' ? 'var(--primary-hover)' : 'var(--text-main)',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      justifyContent: 'center',
                    }}
                  >
                    <CreditCard size={16} /> Debit / Credit Card
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('NETBANKING')}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: paymentMethod === 'NETBANKING' ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                      backgroundColor: paymentMethod === 'NETBANKING' ? 'var(--primary-subtle)' : '#ffffff',
                      color: paymentMethod === 'NETBANKING' ? 'var(--primary-hover)' : 'var(--text-main)',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      justifyContent: 'center',
                    }}
                  >
                    <Building2 size={16} /> Net Banking
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: paymentMethod === 'COD' ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                      backgroundColor: paymentMethod === 'COD' ? 'var(--primary-subtle)' : '#ffffff',
                      color: paymentMethod === 'COD' ? 'var(--primary-hover)' : 'var(--text-main)',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      justifyContent: 'center',
                    }}
                  >
                    <Banknote size={16} /> Cash on Delivery
                  </button>
                </div>

                {/* Sub-inputs based on method */}
                {paymentMethod === 'UPI' && (
                  <div style={{ backgroundColor: 'var(--bg-main)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                    <label className="form-label">Enter UPI ID / VPA</label>
                    <input
                      type="text"
                      className="form-input"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. yourname@oksbi"
                    />
                    <span style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px', display: 'block' }}>
                      (Simulated Gateway: Use any valid UPI ID. Test failures by including "fail".)
                    </span>
                  </div>
                )}

                {paymentMethod === 'CARD' && (
                  <div style={{ backgroundColor: 'var(--bg-main)', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <label className="form-label">Card Number</label>
                      <input
                        type="text"
                        className="form-input"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4532 •••• •••• ••••"
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label className="form-label">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          className="form-input"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="12/28"
                        />
                      </div>
                      <div>
                        <label className="form-label">CVV</label>
                        <input
                          type="password"
                          maxLength={4}
                          className="form-input"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="•••"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'COD' && (
                  <div style={{ padding: '12px', backgroundColor: 'var(--warning-light)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: '#92400e' }}>
                    💵 Cash on delivery enabled. Please have exact change ready upon driver arrival.
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Order Review, Coupon & Bill Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Order Items Review */}
              <div className="card">
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>
                  Order Summary ({restaurant?.name})
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  {items.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                      <span>
                        {item.quantity} × {item.menuItem.name}
                      </span>
                      <span style={{ fontWeight: 600 }}>
                        ${(item.menuItem.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Coupon Code Section */}
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px', marginBottom: '20px' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tag size={14} color="var(--primary)" /> Apply Promo Coupon
                  </label>

                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    <input
                      type="text"
                      placeholder="e.g. FEAST20, WELCOME50, FREESHIP"
                      className="form-input"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      style={{ textTransform: 'uppercase' }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => applyCoupon()}
                      disabled={couponLoading}
                    >
                      {couponLoading ? 'Checking...' : 'Apply'}
                    </button>
                  </div>

                  {/* Quick Clickable Promo Coupons */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    {['FEAST20', 'WELCOME50', 'FREESHIP'].map((cpn) => (
                      <button
                        key={cpn}
                        type="button"
                        onClick={() => applyCoupon(cpn)}
                        style={{
                          background: 'none',
                          border: '1px dashed var(--primary)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '2px 8px',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: 'var(--primary-hover)',
                          cursor: 'pointer',
                        }}
                      >
                        {cpn}
                      </button>
                    ))}
                  </div>

                  {appliedCoupon && (
                    <div
                      style={{
                        backgroundColor: 'var(--success-light)',
                        color: '#065f46',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>
                        <CheckCircle size={14} style={{ display: 'inline', marginRight: '4px' }} />
                        Applied <strong>{appliedCoupon.code}</strong> (-${appliedCoupon.discountAmount.toFixed(2)})
                      </span>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', fontWeight: 700 }}
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {couponError && (
                    <span style={{ fontSize: '12px', color: 'var(--danger)' }}>
                      {couponError}
                    </span>
                  )}
                </div>

                {/* Itemized Bill Breakdown */}
                <div
                  style={{
                    borderTop: '1px solid var(--border-light)',
                    paddingTop: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    fontSize: '14px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Item Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>GST / Taxes (5%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Delivery Charge</span>
                    <span>${deliveryFee.toFixed(2)}</span>
                  </div>

                  {discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)', fontWeight: 600 }}>
                      <span>Coupon Discount ({appliedCoupon?.code})</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div
                    style={{
                      borderTop: '1.5px solid var(--border-light)',
                      paddingTop: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontWeight: 800,
                      fontSize: '18px',
                    }}
                  >
                    <span>To Pay</span>
                    <span style={{ color: 'var(--primary-hover)' }}>${finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Pay & Place Order Button */}
                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-full"
                  disabled={isSubmitting}
                  style={{ marginTop: '24px' }}
                >
                  {isSubmitting ? (
                    'Processing Payment & Order...'
                  ) : (
                    <>
                      Pay ${finalTotal.toFixed(2)} & Place Order <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <div
                  style={{
                    marginTop: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    color: 'var(--text-light)',
                  }}
                >
                  <ShieldCheck size={14} color="#10b981" /> 100% Encrypted & Safe Payment Gateway
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
