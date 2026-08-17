'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UtensilsCrossed,
  User,
  Store,
  Bike,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CUSTOMER',
    phone: '',
    address: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const res = await register(formData);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Registration failed');
    } else {
      if (formData.role === 'ADMIN') router.push('/admin');
      else if (formData.role === 'RESTAURANT_STAFF') router.push('/restaurant/dashboard');
      else if (formData.role === 'DELIVERY_PARTNER') router.push('/delivery/dashboard');
      else router.push('/');
      router.refresh();
    }
  };

  return (
    <div style={{ padding: '50px 0 100px', backgroundColor: 'var(--bg-main)' }}>
      <div className="container" style={{ maxWidth: '540px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: 'var(--shadow-primary)',
            }}
          >
            <UtensilsCrossed size={28} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Create Your Account</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Join FlavorDash as a customer, kitchen partner, driver, or admin
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '28px' }}>
          {errorMsg && (
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: 'var(--danger-light)',
                color: 'var(--danger)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '20px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 600,
              }}
            >
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Role Selector Tabs */}
            <div className="form-group">
              <label className="form-label">I am joining as a:</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'CUSTOMER' })}
                  style={{
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    border: formData.role === 'CUSTOMER' ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                    backgroundColor: formData.role === 'CUSTOMER' ? 'var(--primary-subtle)' : '#ffffff',
                    color: formData.role === 'CUSTOMER' ? 'var(--primary-hover)' : 'var(--text-main)',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    justifyContent: 'center',
                  }}
                >
                  <User size={15} /> Customer
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'RESTAURANT_STAFF' })}
                  style={{
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    border: formData.role === 'RESTAURANT_STAFF' ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                    backgroundColor: formData.role === 'RESTAURANT_STAFF' ? 'var(--primary-subtle)' : '#ffffff',
                    color: formData.role === 'RESTAURANT_STAFF' ? 'var(--primary-hover)' : 'var(--text-main)',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    justifyContent: 'center',
                  }}
                >
                  <Store size={15} /> Kitchen Staff
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'DELIVERY_PARTNER' })}
                  style={{
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    border: formData.role === 'DELIVERY_PARTNER' ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                    backgroundColor: formData.role === 'DELIVERY_PARTNER' ? 'var(--primary-subtle)' : '#ffffff',
                    color: formData.role === 'DELIVERY_PARTNER' ? 'var(--primary-hover)' : 'var(--text-main)',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    justifyContent: 'center',
                  }}
                >
                  <Bike size={15} /> Delivery Partner
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'ADMIN' })}
                  style={{
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    border: formData.role === 'ADMIN' ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                    backgroundColor: formData.role === 'ADMIN' ? 'var(--primary-subtle)' : '#ffffff',
                    color: formData.role === 'ADMIN' ? 'var(--primary-hover)' : 'var(--text-main)',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    justifyContent: 'center',
                  }}
                >
                  <ShieldCheck size={15} /> Administrator
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password (min. 6 characters)</label>
              <input
                type="password"
                required
                minLength={6}
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Default Address</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Street / City"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
              style={{ marginTop: '12px' }}
            >
              {loading ? 'Creating Account...' : 'Complete Registration'} <ArrowRight size={18} />
            </button>
          </form>

          <div
            style={{
              marginTop: '24px',
              textAlign: 'center',
              fontSize: '13px',
              color: 'var(--text-muted)',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '18px',
            }}
          >
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
