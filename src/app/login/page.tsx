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
  Sparkles,
  AlertCircle,
  Lock,
  Mail,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, quickDemoLogin, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const res = await login(email, password);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Invalid credentials');
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div style={{ padding: '60px 0 100px', backgroundColor: 'var(--bg-main)' }}>
      <div className="container" style={{ maxWidth: '520px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
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
          <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Welcome to FlavorDash</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Sign in to manage your orders, kitchen operations, or delivery fleet
          </p>
        </div>

        {/* 1-Click Role Switcher Demo Box */}
        <div
          className="card"
          style={{
            marginBottom: '28px',
            backgroundColor: 'var(--primary-subtle)',
            borderColor: 'rgba(249, 115, 22, 0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Sparkles size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary-hover)' }}>
              1-Click Instant Demo Accounts
            </h3>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Select any of the 4 SRS roles below to log in instantly without typing:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ backgroundColor: '#ffffff', justifyContent: 'flex-start' }}
              onClick={() => quickDemoLogin('CUSTOMER')}
            >
              <User size={14} color="#10b981" /> 1. Customer
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ backgroundColor: '#ffffff', justifyContent: 'flex-start' }}
              onClick={() => quickDemoLogin('RESTAURANT_STAFF')}
            >
              <Store size={14} color="#f59e0b" /> 2. Kitchen Staff
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ backgroundColor: '#ffffff', justifyContent: 'flex-start' }}
              onClick={() => quickDemoLogin('DELIVERY_PARTNER')}
            >
              <Bike size={14} color="#f97316" /> 3. Driver
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ backgroundColor: '#ffffff', justifyContent: 'flex-start' }}
              onClick={() => quickDemoLogin('ADMIN')}
            >
              <ShieldCheck size={14} color="#ef4444" /> 4. Admin
            </button>
          </div>
        </div>

        {/* Regular Login Card */}
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
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                required
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
              style={{ marginTop: '12px' }}
            >
              {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={18} />
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
            Don't have an account?{' '}
            <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
