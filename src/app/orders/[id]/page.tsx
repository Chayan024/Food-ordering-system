'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  Bike,
  UtensilsCrossed,
  Store,
  MapPin,
  FileText,
  AlertCircle,
  Star,
  Receipt,
  ArrowLeft,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { DeliveryMap } from '@/components/tracking/DeliveryMap';

interface TrackingData {
  orderId: string;
  orderNumber: string;
  status: string;
  restaurant: {
    name: string;
    address: string;
    coords: { lat: number; lng: number };
  };
  customer: {
    address: string;
    phone: string;
    coords: { lat: number; lng: number };
  };
  driver: {
    id: string;
    name: string;
    phone?: string | null;
    avatar?: string | null;
  } | null;
  distanceKm: number;
  etaMinutes: number;
}

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);

  // Review & Complaint modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [complaintSubmitted, setComplaintSubmitted] = useState(false);

  const fetchOrderAndTracking = async () => {
    try {
      const [orderRes, trackRes] = await Promise.all([
        fetch(`/api/orders/${id}`),
        fetch(`/api/orders/${id}/track`),
      ]);

      if (orderRes.ok) {
        const oData = await orderRes.json();
        setOrder(oData.order);
      }
      if (trackRes.ok) {
        const tData = await trackRes.json();
        setTracking(tData);
      }
    } catch (err) {
      console.error('Error loading order tracking:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderAndTracking();
    const interval = setInterval(fetchOrderAndTracking, 5000); // Polling every 5s
    return () => clearInterval(interval);
  }, [id]);

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CANCEL' }),
      });
      if (res.ok) {
        await fetchOrderAndTracking();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to cancel order');
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: order.restaurantId,
          orderId: order.id,
          rating,
          comment,
        }),
      });
      if (res.ok) {
        setReviewSubmitted(true);
        setTimeout(() => setShowReviewModal(false), 2000);
      }
    } catch (err) {
      console.error('Submit review error:', err);
    }
  };

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          subject: complaintSubject,
          description: complaintDesc,
        }),
      });
      if (res.ok) {
        setComplaintSubmitted(true);
        setTimeout(() => setShowComplaintModal(false), 2000);
      }
    } catch (err) {
      console.error('Submit complaint error:', err);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading live order tracking...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Order Not Found</h2>
        <Link href="/orders" className="btn btn-primary" style={{ marginTop: '16px' }}>
          Back to My Orders
        </Link>
      </div>
    );
  }

  // Stepper status definitions
  const steps = [
    { key: 'PENDING', label: 'Order Placed', icon: Clock },
    { key: 'ACCEPTED', label: 'Accepted by Kitchen', icon: Store },
    { key: 'PREPARING', label: 'Preparing Food', icon: UtensilsCrossed },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Bike },
    { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'ACCEPTED':
        return 1;
      case 'PREPARING':
      case 'READY_FOR_PICKUP':
        return 2;
      case 'OUT_FOR_DELIVERY':
        return 3;
      case 'DELIVERED':
        return 4;
      default:
        return -1;
    }
  };

  const currentStepIdx = getStepIndex(order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <Link
            href="/orders"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-muted)',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} /> All Orders
          </Link>

          <div style={{ display: 'flex', gap: '10px' }}>
            {order.status === 'PENDING' && (
              <button className="btn btn-danger btn-sm" onClick={handleCancelOrder}>
                <XCircle size={14} /> Cancel Order
              </button>
            )}
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setShowComplaintModal(true)}
            >
              <HelpCircle size={14} /> Need Help?
            </button>
          </div>
        </div>

        {/* Order Header Status Banner */}
        <div
          className="card"
          style={{
            marginBottom: '28px',
            backgroundColor: isCancelled
              ? 'var(--danger-light)'
              : order.status === 'DELIVERED'
              ? 'var(--success-light)'
              : 'var(--primary-subtle)',
            borderColor: isCancelled
              ? 'rgba(239, 68, 68, 0.2)'
              : 'rgba(249, 115, 22, 0.2)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
                {new Date(order.createdAt).toLocaleString()}
              </span>
              <h1 style={{ fontSize: '24px', fontWeight: 800, marginTop: '2px' }}>
                Order #{order.orderNumber}
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {isCancelled
                  ? 'This order was cancelled.'
                  : order.status === 'DELIVERED'
                  ? 'Delivered to your address. Enjoy your meal!'
                  : `Estimated arrival in ~${tracking?.etaMinutes || 25} minutes.`}
              </p>
            </div>

            {order.status === 'DELIVERED' && (
              <button
                className="btn btn-primary"
                onClick={() => setShowReviewModal(true)}
              >
                <Star size={16} fill="#ffffff" /> Rate Experience
              </button>
            )}
          </div>

          {/* 5-Step Visual Stepper */}
          {!isCancelled && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '12px',
                marginTop: '28px',
                paddingTop: '20px',
                borderTop: '1px solid rgba(0, 0, 0, 0.08)',
              }}
            >
              {steps.map((step, idx) => {
                const isCompleted = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                const IconComponent = step.icon;

                return (
                  <div key={step.key} style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        margin: '0 auto 8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isCurrent
                          ? 'var(--primary)'
                          : isCompleted
                          ? 'var(--success)'
                          : '#e2e8f0',
                        color: isCompleted || isCurrent ? '#ffffff' : '#94a3b8',
                        boxShadow: isCurrent ? 'var(--shadow-primary)' : 'none',
                        transition: 'var(--transition)',
                      }}
                    >
                      <IconComponent size={18} />
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: isCurrent ? 800 : isCompleted ? 600 : 500,
                        color: isCurrent
                          ? 'var(--primary-hover)'
                          : isCompleted
                          ? 'var(--text-main)'
                          : 'var(--text-light)',
                        display: 'block',
                      }}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Live Map & Order Details Split View */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '28px',
            alignItems: 'flex-start',
          }}
        >
          {/* Map Column */}
          {tracking && !isCancelled && (
            <DeliveryMap
              orderNumber={order.orderNumber}
              restaurant={tracking.restaurant}
              customer={tracking.customer}
              driver={tracking.driver}
              status={order.status}
              distanceKm={tracking.distanceKm}
              etaMinutes={tracking.etaMinutes}
            />
          )}

          {/* Itemized Order Receipt Details */}
          <div className="card">
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
              Order Breakdown
            </h3>

            {/* Restaurant Info */}
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: 'var(--bg-main)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '16px',
              }}
            >
              <strong style={{ fontSize: '14px' }}>{order.restaurant.name}</strong>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {order.restaurant.address}
              </p>
            </div>

            {/* Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {order.orderItems.map((item: any) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '14px',
                  }}
                >
                  <span>
                    {item.quantity} × {item.name}
                  </span>
                  <span style={{ fontWeight: 600 }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div
              style={{
                borderTop: '1px solid var(--border-light)',
                paddingTop: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '13px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Taxes (5%)</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Delivery Fee</span>
                <span>${order.deliveryFee.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)', fontWeight: 600 }}>
                  <span>Discount</span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div
                style={{
                  borderTop: '1.5px solid var(--border-light)',
                  paddingTop: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 800,
                  fontSize: '16px',
                }}
              >
                <span>Total Paid</span>
                <span style={{ color: 'var(--primary-hover)' }}>${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment & Delivery Address Info */}
            <div
              style={{
                marginTop: '20px',
                borderTop: '1px solid var(--border-light)',
                paddingTop: '16px',
                fontSize: '12px',
                color: 'var(--text-muted)',
                lineHeight: '1.6',
              }}
            >
              <div>
                <strong>Payment Method:</strong> {order.payment?.method || 'UPI'} • {order.payment?.status}
              </div>
              <div>
                <strong>Delivery Address:</strong> {order.deliveryAddress}
              </div>
              {order.specialInstructions && (
                <div>
                  <strong>Instructions:</strong> {order.specialInstructions}
                </div>
              )}
            </div>

            <button
              className="btn btn-outline btn-sm w-full"
              style={{ marginTop: '20px' }}
              onClick={() => window.print()}
            >
              <Receipt size={14} /> Print Receipt / Invoice
            </button>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="modal-backdrop" onClick={() => setShowReviewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
              Rate Your Experience
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              How was your food from {order.restaurant.name}?
            </p>

            {reviewSubmitted ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--success)', fontWeight: 700 }}>
                <CheckCircle2 size={36} style={{ margin: '0 auto 8px' }} />
                Thank you for your feedback!
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit}>
                {/* Star rating selector */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', justifyContent: 'center' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                    >
                      <Star
                        size={28}
                        fill={star <= rating ? '#f59e0b' : 'none'}
                        color={star <= rating ? '#f59e0b' : '#cbd5e1'}
                      />
                    </button>
                  ))}
                </div>

                <div className="form-group">
                  <label className="form-label">Your Review / Comments</label>
                  <textarea
                    rows={3}
                    required
                    className="form-textarea"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us what you loved about the meal..."
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowReviewModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Submit Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Complaint Support Ticket Modal */}
      {showComplaintModal && (
        <div className="modal-backdrop" onClick={() => setShowComplaintModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
              Report an Issue / Support Ticket
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              We are here to help resolve any issue with Order #{order.orderNumber}.
            </p>

            {complaintSubmitted ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--success)', fontWeight: 700 }}>
                <CheckCircle2 size={36} style={{ margin: '0 auto 8px' }} />
                Your ticket has been submitted to support!
              </div>
            ) : (
              <form onSubmit={handleComplaintSubmit}>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <select
                    className="form-select"
                    value={complaintSubject}
                    onChange={(e) => setComplaintSubject(e.target.value)}
                    required
                  >
                    <option value="">Select an issue category</option>
                    <option value="Missing Item">Missing item from order</option>
                    <option value="Food Quality / Cold">Food arrived cold / spilled</option>
                    <option value="Late Delivery">Delivery delay</option>
                    <option value="Incorrect Order">Incorrect dish received</option>
                    <option value="Other Issue">Other inquiry</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Description of Issue</label>
                  <textarea
                    rows={4}
                    required
                    className="form-textarea"
                    value={complaintDesc}
                    onChange={(e) => setComplaintDesc(e.target.value)}
                    placeholder="Please explain in detail what went wrong..."
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowComplaintModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Submit Complaint
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
