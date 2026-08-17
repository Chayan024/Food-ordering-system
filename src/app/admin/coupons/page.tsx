'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Calendar,
  Percent,
} from 'lucide-react';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountPercent: '20',
    maxDiscount: '10',
    minOrderValue: '25',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/admin/coupons');
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch (err) {
      console.error('Error fetching coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.code.toUpperCase(),
          description: formData.description,
          discountPercent: parseFloat(formData.discountPercent),
          maxDiscount: parseFloat(formData.maxDiscount),
          minOrderValue: parseFloat(formData.minOrderValue),
          validUntil: formData.validUntil,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to create coupon');
      } else {
        setShowModal(false);
        setFormData({
          code: '',
          description: '',
          discountPercent: '20',
          maxDiscount: '10',
          minOrderValue: '25',
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
        await fetchCoupons();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCouponStatus = async (coupon: any) => {
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: coupon.id,
          isActive: !coupon.isActive,
        }),
      });
      if (res.ok) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === coupon.id ? { ...c, isActive: !c.isActive } : c))
        );
      }
    } catch (err) {
      console.error('Error toggling coupon:', err);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error('Error deleting coupon:', err);
    }
  };

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
            <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Coupons & Promotions Engine</h1>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Create discount vouchers, percentage coupons, minimum order constraints, and usage limits.
            </p>
          </div>

          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Create New Coupon
          </button>
        </div>

        {/* Coupons Table */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--secondary-subtle)', borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Code</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Description</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Discount Details</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Min Order</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Valid Until</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Times Redeemed</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: '14px',
                          color: 'var(--primary-hover)',
                          backgroundColor: 'var(--primary-light)',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontFamily: 'monospace',
                        }}
                      >
                        {c.code}
                      </span>
                    </td>

                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      {c.description}
                    </td>

                    <td style={{ padding: '14px 20px', fontWeight: 700 }}>
                      {c.discountPercent}% Off (Max ${c.maxDiscount.toFixed(2)})
                    </td>

                    <td style={{ padding: '14px 20px', fontSize: '13px' }}>
                      ${c.minOrderValue.toFixed(2)}
                    </td>

                    <td style={{ padding: '14px 20px', fontSize: '13px' }}>
                      {new Date(c.validUntil).toLocaleDateString()}
                    </td>

                    <td style={{ padding: '14px 20px', fontSize: '13px' }}>
                      {c.usageCount} orders
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      <span className={`badge ${c.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {c.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>

                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          className={`btn btn-sm ${c.isActive ? 'btn-outline' : 'btn-primary'}`}
                          style={{ fontSize: '12px' }}
                          onClick={() => toggleCouponStatus(c)}
                        >
                          {c.isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ padding: '4px 8px' }}
                          onClick={() => handleDeleteCoupon(c.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Coupon Modal */}
        {showModal && (
          <div className="modal-backdrop" onClick={() => setShowModal(false)}>
            <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
                Create New Promotional Coupon
              </h3>

              {errorMsg && (
                <div style={{ padding: '10px', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '14px', fontSize: '13px' }}>
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleCreateCoupon}>
                <div className="form-group">
                  <label className="form-label">Coupon Code (Uppercase)</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. SUMMER30, FESTIVE100"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="30% discount on all gourmet orders above $30"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Discount Percentage (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      required
                      className="form-input"
                      value={formData.discountPercent}
                      onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                      placeholder="20"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Discount Cap ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="form-input"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                      placeholder="15.00"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Minimum Order Value ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="form-input"
                      value={formData.minOrderValue}
                      onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                      placeholder="25.00"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input
                      type="date"
                      required
                      className="form-input"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create Coupon'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
