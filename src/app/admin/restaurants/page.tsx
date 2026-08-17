'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Store,
  Star,
  CheckCircle,
  XCircle,
  ArrowLeft,
  DollarSign,
  Plus,
} from 'lucide-react';

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRestaurants = async () => {
    try {
      const res = await fetch('/api/admin/restaurants');
      if (res.ok) {
        const data = await res.json();
        setRestaurants(data.restaurants || []);
      }
    } catch (err) {
      console.error('Error fetching admin restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const toggleRestaurantOpen = async (rest: any) => {
    try {
      const res = await fetch('/api/admin/restaurants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: rest.id,
          isOpen: !rest.isOpen,
        }),
      });
      if (res.ok) {
        setRestaurants((prev) =>
          prev.map((r) => (r.id === rest.id ? { ...r, isOpen: !r.isOpen } : r))
        );
      }
    } catch (err) {
      console.error('Error toggling restaurant:', err);
    }
  };

  return (
    <div style={{ padding: '36px 0 80px' }}>
      <div className="container-wide">
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <Link
            href="/admin"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-muted)',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '8px',
            }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Restaurant Moderation & Listings</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Manage platform restaurants, delivery fees, minimum orders, and kitchen statuses.
          </p>
        </div>

        {/* Restaurants Table */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--secondary-subtle)', borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Restaurant & Cuisine</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Owner / Staff</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Rating</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Menu Items</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Delivery Fee</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map((rest) => (
                  <tr key={rest.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={rest.image}
                          alt={rest.name}
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: 'var(--radius-md)',
                            objectFit: 'cover',
                          }}
                        />
                        <div>
                          <strong>{rest.name}</strong>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {rest.cuisineType} • {rest.city}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      {rest.owner?.name ? `${rest.owner.name} (${rest.owner.email})` : 'Unassigned'}
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                        <Star size={14} fill="#f59e0b" color="#f59e0b" /> {rest.rating.toFixed(1)}
                      </span>
                    </td>

                    <td style={{ padding: '14px 20px', fontSize: '13px' }}>
                      {rest._count.menuItems} dishes ({rest._count.orders} orders)
                    </td>

                    <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 600 }}>
                      ${rest.deliveryFee.toFixed(2)} (Min: ${rest.minOrder.toFixed(2)})
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      <span className={`badge ${rest.isOpen ? 'badge-success' : 'badge-danger'}`}>
                        {rest.isOpen ? 'Active / Open' : 'Closed'}
                      </span>
                    </td>

                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <button
                        className={`btn btn-sm ${rest.isOpen ? 'btn-outline' : 'btn-primary'}`}
                        style={{ fontSize: '12px' }}
                        onClick={() => toggleRestaurantOpen(rest)}
                      >
                        {rest.isOpen ? 'Disable' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
