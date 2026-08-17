'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Receipt,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function CustomerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="badge badge-success">Delivered</span>;
      case 'CANCELLED':
        return <span className="badge badge-danger">Cancelled</span>;
      case 'OUT_FOR_DELIVERY':
        return <span className="badge badge-primary">🛵 Out for Delivery</span>;
      case 'PREPARING':
        return <span className="badge badge-warning">👨‍🍳 Cooking in Kitchen</span>;
      case 'READY_FOR_PICKUP':
        return <span className="badge badge-warning">📦 Ready for Pickup</span>;
      default:
        return <span className="badge badge-muted">⏳ Placed</span>;
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800 }}>My Orders</h1>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Track past meals, delivery receipts, and live order status
            </p>
          </div>
          <Link href="/" className="btn btn-outline btn-sm">
            Browse Restaurants
          </Link>
        </div>

        {orders.length === 0 ? (
          <div
            className="card"
            style={{ textAlign: 'center', padding: '60px 20px' }}
          >
            <div
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-muted)',
                margin: '0 auto 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-light)',
              }}
            >
              <Receipt size={32} />
            </div>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>No orders yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
              Your order history will appear here once you place your first order.
            </p>
            <Link href="/" className="btn btn-primary">
              Order Your First Meal
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {orders.map((order) => (
              <div key={order.id} className="card" style={{ padding: '20px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    marginBottom: '16px',
                    borderBottom: '1px solid var(--border-subtle)',
                    paddingBottom: '14px',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Order #{order.orderNumber} • {new Date(order.createdAt).toLocaleDateString()} at{' '}
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, marginTop: '2px' }}>
                      {order.restaurant.name}
                    </h3>
                  </div>
                  <div>{getStatusBadge(order.status)}</div>
                </div>

                {/* Items preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                  {order.orderItems.map((item: any) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '13px',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <span>
                        {item.quantity} × {item.name}
                      </span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Footer action bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '14px',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ fontSize: '14px' }}>
                    Total: <strong style={{ fontSize: '16px' }}>${order.totalAmount.toFixed(2)}</strong>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Link
                      href={`/restaurant/${order.restaurantId}`}
                      className="btn btn-outline btn-sm"
                    >
                      <ShoppingBag size={14} /> Order Again
                    </Link>
                    <Link
                      href={`/orders/${order.id}`}
                      className="btn btn-primary btn-sm"
                    >
                      Track Order <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
