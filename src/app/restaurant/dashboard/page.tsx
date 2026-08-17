'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Store,
  Clock,
  CheckCircle,
  XCircle,
  UtensilsCrossed,
  ChefHat,
  Bike,
  DollarSign,
  Package,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function RestaurantDashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchKitchenOrders = async () => {
    try {
      const res = await fetch('/api/restaurant/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setRestaurant(data.restaurant || null);
      }
    } catch (err) {
      console.error('Error fetching kitchen orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchenOrders();
    const interval = setInterval(fetchKitchenOrders, 6000); // Poll kitchen orders every 6s
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: string, action: 'ACCEPT' | 'PREPARE' | 'READY' | 'REJECT') => {
    setUpdatingId(orderId);
    try {
      const res = await fetch('/api/restaurant/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, action }),
      });
      if (res.ok) {
        await fetchKitchenOrders();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update order');
      }
    } catch (err) {
      console.error('Error updating order:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleStoreStatus = async () => {
    if (!restaurant) return;
    try {
      const res = await fetch(`/api/restaurants/${restaurant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOpen: !restaurant.isOpen }),
      });
      if (res.ok) {
        await fetchKitchenOrders();
      }
    } catch (err) {
      console.error('Error toggling store status:', err);
    }
  };

  // Group orders into Kitchen Kanban stages
  const pendingOrders = orders.filter((o) => o.status === 'PENDING');
  const preparingOrders = orders.filter((o) => o.status === 'ACCEPTED' || o.status === 'PREPARING');
  const readyOrders = orders.filter((o) => o.status === 'READY_FOR_PICKUP' || o.status === 'OUT_FOR_DELIVERY');
  const completedOrders = orders.filter((o) => o.status === 'DELIVERED');

  const totalKitchenRevenue = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.subtotal, 0);

  return (
    <div style={{ padding: '36px 0 80px' }}>
      <div className="container-wide">
        {/* Top Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '28px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-warning">Restaurant Staff Portal</span>
              {restaurant && (
                <span className={`badge ${restaurant.isOpen ? 'badge-success' : 'badge-danger'}`}>
                  {restaurant.isOpen ? '● Kitchen Open' : '○ Kitchen Closed'}
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px' }}>
              {restaurant ? restaurant.name : 'Kitchen Management Board'}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {restaurant && (
              <button
                className={`btn btn-sm ${restaurant.isOpen ? 'btn-outline' : 'btn-primary'}`}
                onClick={toggleStoreStatus}
              >
                {restaurant.isOpen ? 'Pause Incoming Orders' : 'Open Store for Orders'}
              </button>
            )}
            <Link href="/restaurant/menu" className="btn btn-primary btn-sm">
              <UtensilsCrossed size={15} /> Manage Menu Items
            </Link>
            <button className="btn btn-outline btn-sm" onClick={fetchKitchenOrders}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        {/* Metric summary banner */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '18px',
            marginBottom: '32px',
          }}
        >
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px' }}>
            <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <Package size={22} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pending Confirmation</div>
              <div style={{ fontSize: '22px', fontWeight: 800 }}>{pendingOrders.length}</div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px' }}>
            <div style={{ backgroundColor: 'var(--warning-light)', color: '#b45309', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <ChefHat size={22} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Active in Kitchen</div>
              <div style={{ fontSize: '22px', fontWeight: 800 }}>{preparingOrders.length}</div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px' }}>
            <div style={{ backgroundColor: 'var(--info-light)', color: '#1d4ed8', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <Bike size={22} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ready / With Driver</div>
              <div style={{ fontSize: '22px', fontWeight: 800 }}>{readyOrders.length}</div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px' }}>
            <div style={{ backgroundColor: 'var(--success-light)', color: '#047857', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <DollarSign size={22} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Kitchen Revenue</div>
              <div style={{ fontSize: '22px', fontWeight: 800 }}>${totalKitchenRevenue.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* 3-Column Kitchen Order Board */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            alignItems: 'flex-start',
          }}
        >
          {/* Column 1: New Incoming Orders */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
                paddingBottom: '8px',
                borderBottom: '2px solid var(--primary)',
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>
                1. New Orders ({pendingOrders.length})
              </h3>
              <span className="badge badge-primary">Action Required</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {pendingOrders.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '30px' }}>
                  No new incoming orders right now.
                </div>
              ) : (
                pendingOrders.map((order) => (
                  <div key={order.id} className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '15px' }}>#{order.orderNumber}</strong>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      Customer: <strong>{order.customer?.name}</strong> ({order.customerPhone})
                    </div>

                    {/* Order items */}
                    <div style={{ backgroundColor: 'var(--bg-main)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', marginBottom: '14px', fontSize: '13px' }}>
                      {order.orderItems.map((item: any) => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span>{item.quantity} × {item.name}</span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      {order.specialInstructions && (
                        <div style={{ fontSize: '11px', color: 'var(--primary-hover)', marginTop: '6px' }}>
                          ⚠️ Note: {order.specialInstructions}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1 }}
                        disabled={updatingId === order.id}
                        onClick={() => handleUpdateStatus(order.id, 'ACCEPT')}
                      >
                        <CheckCircle size={14} /> Accept Order
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={updatingId === order.id}
                        onClick={() => handleUpdateStatus(order.id, 'REJECT')}
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 2: In Kitchen Preparation */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
                paddingBottom: '8px',
                borderBottom: '2px solid #b45309',
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>
                2. In Preparation ({preparingOrders.length})
              </h3>
              <span className="badge badge-warning">Cooking</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {preparingOrders.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '30px' }}>
                  No dishes currently in preparation.
                </div>
              ) : (
                preparingOrders.map((order) => (
                  <div key={order.id} className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '15px' }}>#{order.orderNumber}</strong>
                      <span className="badge badge-warning">
                        {order.status === 'ACCEPTED' ? 'Accepted' : 'Preparing'}
                      </span>
                    </div>

                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      Customer: <strong>{order.customer?.name}</strong>
                    </div>

                    <div style={{ backgroundColor: 'var(--bg-main)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', marginBottom: '14px', fontSize: '13px' }}>
                      {order.orderItems.map((item: any) => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span>{item.quantity} × {item.name}</span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {order.status === 'ACCEPTED' && (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ flex: 1 }}
                          disabled={updatingId === order.id}
                          onClick={() => handleUpdateStatus(order.id, 'PREPARE')}
                        >
                          <ChefHat size={14} /> Start Cooking
                        </button>
                      )}
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1 }}
                        disabled={updatingId === order.id}
                        onClick={() => handleUpdateStatus(order.id, 'READY')}
                      >
                        <Package size={14} /> Mark Ready for Driver
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 3: Ready for Pickup & Out for Delivery */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
                paddingBottom: '8px',
                borderBottom: '2px solid #10b981',
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>
                3. Ready / Dispatched ({readyOrders.length})
              </h3>
              <span className="badge badge-success">Driver Pickup</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {readyOrders.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '30px' }}>
                  No orders currently waiting for pickup.
                </div>
              ) : (
                readyOrders.map((order) => (
                  <div key={order.id} className="card" style={{ borderLeft: '4px solid #10b981' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '15px' }}>#{order.orderNumber}</strong>
                      <span className="badge badge-success">
                        {order.status === 'READY_FOR_PICKUP' ? 'Ready on Counter' : 'Out with Driver'}
                      </span>
                    </div>

                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      {order.delivery?.deliveryPartner ? (
                        <span>
                          Driver: <strong>{order.delivery.deliveryPartner.name}</strong> ({order.delivery.deliveryPartner.phone})
                        </span>
                      ) : (
                        <span style={{ color: 'var(--warning)' }}>Awaiting driver assignment</span>
                      )}
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                      Total Items: {order.orderItems.reduce((s: number, i: any) => s + i.quantity, 0)} • Total: ${order.totalAmount.toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
