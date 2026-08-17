'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Store,
  AlertCircle,
  TrendingUp,
  Download,
  ShieldCheck,
  Tag,
  MessageSquare,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [topDishes, setTopDishes] = useState<any[]>([]);
  const [cuisineBreakdown, setCuisineBreakdown] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminMetrics = async () => {
    try {
      const res = await fetch('/api/admin/metrics');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
        setTopDishes(data.topDishes || []);
        setCuisineBreakdown(data.cuisineBreakdown || []);
      }
    } catch (err) {
      console.error('Error fetching admin metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminMetrics();
  }, []);

  const handleExportCSV = () => {
    window.location.href = '/api/admin/export';
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading administrator analytics...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '36px 0 80px' }}>
      <div className="container-wide">
        {/* Header */}
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
              <span className="badge badge-danger">Administrator Control Center</span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px' }}>
              Platform Overview & Business Intelligence
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-outline btn-sm" onClick={handleExportCSV}>
              <Download size={15} /> Export Audit CSV
            </button>
            <Link href="/admin/coupons" className="btn btn-primary btn-sm">
              <Tag size={15} /> Create Offer / Coupon
            </Link>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '32px',
          }}
        >
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total Gross Revenue</span>
              <div style={{ backgroundColor: 'var(--success-light)', color: '#047857', padding: '6px', borderRadius: '8px' }}>
                <DollarSign size={18} />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800 }}>${metrics?.totalRevenue.toFixed(2)}</div>
            <span style={{ fontSize: '12px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <TrendingUp size={12} /> +18.4% this month
            </span>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total Platform Orders</span>
              <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '6px', borderRadius: '8px' }}>
                <ShoppingBag size={18} />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800 }}>{metrics?.totalOrders}</div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Across {metrics?.totalRestaurants} restaurants
            </span>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Registered Users</span>
              <div style={{ backgroundColor: 'var(--info-light)', color: '#1d4ed8', padding: '6px', borderRadius: '8px' }}>
                <Users size={18} />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800 }}>{metrics?.totalUsers}</div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              4 Role Classes
            </span>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Open Support Tickets</span>
              <div style={{ backgroundColor: 'var(--warning-light)', color: '#b45309', padding: '6px', borderRadius: '8px' }}>
                <AlertCircle size={18} />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800 }}>{metrics?.openComplaints}</div>
            <Link href="/admin/complaints" style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, marginTop: '4px', display: 'block' }}>
              View & Resolve Tickets →
            </Link>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Order Cancellation Rate</span>
              <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '6px', borderRadius: '8px' }}>
                <AlertCircle size={18} />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800 }}>{metrics?.cancellationRate}%</div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Healthy benchmark (&lt; 5%)
            </span>
          </div>
        </div>

        {/* Analytics Breakdown & Top Dishes Leaderboard */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '28px',
            marginBottom: '36px',
          }}
        >
          {/* Top Selling Dishes */}
          <div className="card">
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={20} color="var(--primary)" /> Top-Selling Menu Items
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {topDishes.map((dish, idx) => (
                <div
                  key={dish.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    backgroundColor: 'var(--bg-main)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: '14px',
                        color: 'var(--primary)',
                        width: '20px',
                      }}
                    >
                      #{idx + 1}
                    </span>
                    <div>
                      <strong style={{ fontSize: '14px' }}>{dish.name}</strong>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {dish.restaurant} • ${dish.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-primary">{dish.orderCount} Orders</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cuisine Volume Breakdown */}
          <div className="card">
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>
              Orders by Cuisine Distribution
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {cuisineBreakdown.map((item) => (
                <div key={item.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                    <strong>{item.name}</strong>
                    <span style={{ color: 'var(--text-muted)' }}>{item.orders} orders</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'var(--bg-muted)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        backgroundColor: 'var(--primary)',
                        width: `${Math.min(100, (item.orders / (metrics?.totalOrders || 1)) * 100)}%`,
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Management Quick Navigation Hub */}
        <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px' }}>
          Administration Modules
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
          }}
        >
          <Link href="/admin/users" className="card card-interactive" style={{ padding: '20px' }}>
            <div style={{ backgroundColor: 'var(--info-light)', color: '#1d4ed8', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <Users size={20} />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>User & Role Management</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Manage account roles, permissions, and status across all 4 user classes.</p>
          </Link>

          <Link href="/admin/restaurants" className="card card-interactive" style={{ padding: '20px' }}>
            <div style={{ backgroundColor: 'var(--warning-light)', color: '#b45309', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <Store size={20} />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>Restaurant Moderation</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Review restaurant approvals, commission rates, and operating status.</p>
          </Link>

          <Link href="/admin/coupons" className="card card-interactive" style={{ padding: '20px' }}>
            <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <Tag size={20} />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>Coupons & Promotions</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Create discount campaigns, percentage vouchers, and minimum order rules.</p>
          </Link>

          <Link href="/admin/complaints" className="card card-interactive" style={{ padding: '20px' }}>
            <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <MessageSquare size={20} />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>Support & Disputes</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Resolve customer complaints, issue refunds, and provide resolution notes.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
