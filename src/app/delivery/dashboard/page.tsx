'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bike,
  Store,
  Home,
  MapPin,
  CheckCircle,
  Clock,
  Phone,
  DollarSign,
  Award,
  Navigation,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { DeliveryMap } from '@/components/tracking/DeliveryMap';

export default function DeliveryDashboardPage() {
  const { user } = useAuth();
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [myDeliveries, setMyDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchDriverOrders = async () => {
    try {
      const res = await fetch('/api/delivery/orders');
      if (res.ok) {
        const data = await res.json();
        setAvailableOrders(data.availableOrders || []);
        setMyDeliveries(data.myDeliveries || []);
      }
    } catch (err) {
      console.error('Error loading driver orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverOrders();
    const interval = setInterval(fetchDriverOrders, 5000); // Polling every 5s
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (
    orderId: string,
    action: 'ASSIGN' | 'ARRIVED_AT_STORE' | 'PICKUP' | 'DELIVER'
  ) => {
    setActionLoading(orderId);
    try {
      const res = await fetch('/api/delivery/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, action }),
      });
      if (res.ok) {
        await fetchDriverOrders();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update delivery');
      }
    } catch (err) {
      console.error('Error updating delivery:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const activeDeliveries = myDeliveries.filter(
    (o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
  );
  const completedDeliveries = myDeliveries.filter((o) => o.status === 'DELIVERED');

  const totalEarnings = completedDeliveries.reduce((sum, o) => sum + (o.deliveryFee + 2.5), 0);

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
              <span className="badge badge-primary">Delivery Partner Fleet</span>
              <span className={`badge ${isOnline ? 'badge-success' : 'badge-danger'}`}>
                {isOnline ? '● Online & Receiving Orders' : '○ Offline'}
              </span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px' }}>
              Welcome back, {user?.name || 'Driver'}!
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              className={`btn btn-sm ${isOnline ? 'btn-outline' : 'btn-primary'}`}
              onClick={() => setIsOnline(!isOnline)}
            >
              {isOnline ? 'Go Offline' : 'Go Online (Start Shift)'}
            </button>
            <button className="btn btn-outline btn-sm" onClick={fetchDriverOrders}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '18px',
            marginBottom: '32px',
          }}
        >
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px' }}>
            <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <Bike size={22} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Active Deliveries</div>
              <div style={{ fontSize: '22px', fontWeight: 800 }}>{activeDeliveries.length}</div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px' }}>
            <div style={{ backgroundColor: 'var(--success-light)', color: '#047857', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <CheckCircle size={22} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Completed Trips</div>
              <div style={{ fontSize: '22px', fontWeight: 800 }}>{completedDeliveries.length}</div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px' }}>
            <div style={{ backgroundColor: 'var(--warning-light)', color: '#b45309', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <DollarSign size={22} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Today's Driver Payout</div>
              <div style={{ fontSize: '22px', fontWeight: 800 }}>${totalEarnings.toFixed(2)}</div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px' }}>
            <div style={{ backgroundColor: 'var(--info-light)', color: '#1d4ed8', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <Award size={22} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Driver Rating</div>
              <div style={{ fontSize: '22px', fontWeight: 800 }}>4.9 ★</div>
            </div>
          </div>
        </div>

        {/* Main Content: Active Deliveries & Available Pool */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '32px',
            alignItems: 'flex-start',
          }}
        >
          {/* Active Assigned Deliveries */}
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px' }}>
              My Active Deliveries ({activeDeliveries.length})
            </h2>

            {activeDeliveries.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', padding: '40px 20px' }}>
                No active delivery in progress. Check the available pool below to accept a trip!
              </div>
            ) : (
              activeDeliveries.map((order) => {
                const deliveryState = order.delivery?.deliveryStatus || 'ASSIGNED';
                return (
                  <div
                    key={order.id}
                    className="card"
                    style={{
                      marginBottom: '20px',
                      borderLeft: '5px solid var(--primary)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <strong style={{ fontSize: '16px' }}>Order #{order.orderNumber}</strong>
                      <span className="badge badge-primary">
                        {deliveryState.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Pickup Restaurant & Dropoff address */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', gap: '8px', fontSize: '13px' }}>
                        <Store size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong>Pickup: {order.restaurant.name}</strong>
                          <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{order.restaurant.address}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', fontSize: '13px' }}>
                        <Home size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong>Dropoff: {order.customer?.name}</strong>
                          <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{order.deliveryAddress}</div>
                          <div style={{ color: 'var(--text-light)', fontSize: '11px' }}>Phone: {order.customerPhone}</div>
                        </div>
                      </div>
                    </div>

                    {/* Step Action Buttons */}
                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {deliveryState === 'ASSIGNED' && (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ flex: 1 }}
                          disabled={actionLoading === order.id}
                          onClick={() => handleUpdateStatus(order.id, 'ARRIVED_AT_STORE')}
                        >
                          <Store size={14} /> 1. Arrived at Restaurant
                        </button>
                      )}

                      {(deliveryState === 'ASSIGNED' || deliveryState === 'ARRIVED_AT_STORE') && (
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1 }}
                          disabled={actionLoading === order.id}
                          onClick={() => handleUpdateStatus(order.id, 'PICKUP')}
                        >
                          <Bike size={14} /> 2. Picked Up (Start Route)
                        </button>
                      )}

                      {deliveryState === 'OUT_FOR_DELIVERY' && (
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1, backgroundColor: 'var(--success)' }}
                          disabled={actionLoading === order.id}
                          onClick={() => handleUpdateStatus(order.id, 'DELIVER')}
                        >
                          <CheckCircle size={14} /> 3. Delivered Successfully
                        </button>
                      )}

                      <Link
                        href={`/orders/${order.id}`}
                        className="btn btn-outline btn-sm"
                        target="_blank"
                      >
                        <Navigation size={14} /> Open Live Map
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Available Delivery Requests Pool */}
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px' }}>
              Available Delivery Pool ({availableOrders.length})
            </h2>

            {availableOrders.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', padding: '40px 20px' }}>
                No unassigned deliveries available at this moment. New requests appear in real time.
              </div>
            ) : (
              availableOrders.map((order) => (
                <div key={order.id} className="card" style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '15px' }}>Order #{order.orderNumber}</strong>
                    <span style={{ fontWeight: 800, color: 'var(--primary-hover)', fontSize: '15px' }}>
                      +${(order.deliveryFee + 2.5).toFixed(2)} payout
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', marginBottom: '4px' }}>
                    Pickup: <strong>{order.restaurant.name}</strong>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    Dropoff to: {order.deliveryAddress}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                      {order.orderItems.length} items • Status: {order.status}
                    </span>
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={actionLoading === order.id}
                      onClick={() => handleUpdateStatus(order.id, 'ASSIGN')}
                    >
                      <Bike size={14} /> Accept Delivery
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
