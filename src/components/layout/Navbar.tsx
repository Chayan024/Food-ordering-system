'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  UtensilsCrossed,
  ShoppingBag,
  User,
  LogOut,
  Sparkles,
  ShieldCheck,
  Bike,
  Store,
  ChevronDown,
  Receipt,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { NotificationCenter } from '../notifications/NotificationCenter';

export function Navbar() {
  const { user, logout, quickDemoLogin } = useAuth();
  const { itemCount, subtotal, toggleCart } = useCart();
  const pathname = usePathname();
  const [showRoleModal, setShowRoleModal] = useState(false);

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return <span className="badge badge-danger"><ShieldCheck size={12} /> Administrator</span>;
      case 'RESTAURANT_STAFF':
        return <span className="badge badge-warning"><Store size={12} /> Restaurant Staff</span>;
      case 'DELIVERY_PARTNER':
        return <span className="badge badge-primary"><Bike size={12} /> Delivery Partner</span>;
      default:
        return <span className="badge badge-success"><User size={12} /> Customer</span>;
    }
  };

  return (
    <>
      <header className="navbar">
        <div className="container-wide w-full flex items-center justify-between">
          {/* Brand Logo & Demo Quick Switcher */}
          <div className="flex items-center gap-4">
            <Link href="/" className="logo">
              <div
                style={{
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  color: 'white',
                  padding: '8px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--glass-shadow-primary)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                }}
              >
                <UtensilsCrossed size={20} />
              </div>
              <span style={{ letterSpacing: '-0.03em' }}>FlavorDash</span>
            </Link>

            {/* Quick Demo Switcher Pill */}
            <button
              onClick={() => setShowRoleModal(true)}
              className="btn btn-outline btn-sm"
              style={{
                backgroundColor: 'rgba(254, 215, 170, 0.5)',
                borderColor: 'rgba(249, 115, 22, 0.4)',
                color: 'var(--primary-hover)',
                fontWeight: 700,
                backdropFilter: 'blur(8px)',
              }}
              title="Click to quickly switch roles (Customer, Staff, Driver, Admin)"
            >
              <Sparkles size={14} /> Switch Demo Role <ChevronDown size={12} />
            </button>
          </div>

          {/* Dynamic Role Navigation Links */}
          <nav className="flex items-center gap-3" style={{ display: 'flex' }}>
            {(!user || user.role === 'CUSTOMER') && (
              <>
                <Link
                  href="/"
                  className={`btn btn-sm ${
                    pathname === '/' ? 'btn-primary' : 'btn-ghost'
                  }`}
                >
                  Explore Restaurants
                </Link>
                {user && (
                  <Link
                    href="/orders"
                    className={`btn btn-sm ${
                      pathname.startsWith('/orders') && pathname !== '/orders'
                        ? 'btn-ghost'
                        : pathname === '/orders'
                        ? 'btn-primary'
                        : 'btn-ghost'
                    }`}
                  >
                    <Receipt size={15} /> My Orders
                  </Link>
                )}
              </>
            )}

            {user?.role === 'RESTAURANT_STAFF' && (
              <>
                <Link
                  href="/restaurant/dashboard"
                  className={`btn btn-sm ${
                    pathname === '/restaurant/dashboard' ? 'btn-primary' : 'btn-ghost'
                  }`}
                >
                  <Store size={15} /> Kitchen Orders
                </Link>
                <Link
                  href="/restaurant/menu"
                  className={`btn btn-sm ${
                    pathname === '/restaurant/menu' ? 'btn-primary' : 'btn-ghost'
                  }`}
                >
                  <UtensilsCrossed size={15} /> Menu Editor
                </Link>
              </>
            )}

            {user?.role === 'DELIVERY_PARTNER' && (
              <Link
                href="/delivery/dashboard"
                className={`btn btn-sm ${
                  pathname === '/delivery/dashboard' ? 'btn-primary' : 'btn-ghost'
                }`}
              >
                <Bike size={15} /> Active Deliveries Pool
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <>
                <Link
                  href="/admin"
                  className={`btn btn-sm ${
                    pathname === '/admin' ? 'btn-primary' : 'btn-ghost'
                  }`}
                >
                  <ShieldCheck size={15} /> Dashboard
                </Link>
                <Link
                  href="/admin/users"
                  className={`btn btn-sm ${
                    pathname === '/admin/users' ? 'btn-primary' : 'btn-ghost'
                  }`}
                >
                  Users
                </Link>
                <Link
                  href="/admin/restaurants"
                  className={`btn btn-sm ${
                    pathname === '/admin/restaurants' ? 'btn-primary' : 'btn-ghost'
                  }`}
                >
                  Restaurants
                </Link>
                <Link
                  href="/admin/coupons"
                  className={`btn btn-sm ${
                    pathname === '/admin/coupons' ? 'btn-primary' : 'btn-ghost'
                  }`}
                >
                  Coupons
                </Link>
                <Link
                  href="/admin/complaints"
                  className={`btn btn-sm ${
                    pathname === '/admin/complaints' ? 'btn-primary' : 'btn-ghost'
                  }`}
                >
                  Support Desk
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Icons: Notification, Cart, User Profile */}
          <div className="flex items-center gap-3">
            {user && <NotificationCenter />}

            {/* Cart Trigger */}
            <button
              onClick={toggleCart}
              className="btn btn-primary btn-sm"
              style={{ position: 'relative', paddingRight: '16px' }}
              aria-label="View Cart"
            >
              <ShoppingBag size={17} />
              <span>${subtotal.toFixed(2)}</span>
              {itemCount > 0 && (
                <span
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    color: 'var(--primary)',
                    borderRadius: 'var(--radius-full)',
                    padding: '2px 7px',
                    fontSize: '11px',
                    fontWeight: 800,
                    marginLeft: '4px',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                  }}
                >
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Profile or Login */}
            {user ? (
              <div className="flex items-center gap-2">
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>{user.name}</span>
                  {getRoleBadge(user.role)}
                </div>
                <button
                  onClick={() => logout()}
                  className="btn btn-outline btn-sm"
                  title="Log out"
                  style={{ padding: '6px 8px' }}
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="btn btn-outline btn-sm">
                  Sign In
                </Link>
                <Link href="/register" className="btn btn-primary btn-sm">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Role Switcher Interactive Modal */}
      {showRoleModal && (
        <div className="modal-backdrop" onClick={() => setShowRoleModal(false)}>
          <div
            className="modal-content animate-fade-in"
            style={{ maxWidth: '480px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Quick Role Switcher</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Instantly preview all 4 user portals with pre-seeded accounts:
                </p>
              </div>
              <button
                onClick={() => setShowRoleModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              <button
                className="card card-interactive"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 18px',
                  border: user?.role === 'CUSTOMER' ? '2px solid var(--primary)' : undefined,
                }}
                onClick={() => {
                  quickDemoLogin('CUSTOMER');
                  setShowRoleModal(false);
                }}
              >
                <div style={{ backgroundColor: 'var(--success-light)', color: '#047857', padding: '10px', borderRadius: '50%' }}>
                  <User size={20} />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: '15px' }}>1. Customer (Alex Johnson)</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Browse restaurants, cart drawer, checkout & live map tracking</div>
                </div>
              </button>

              <button
                className="card card-interactive"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 18px',
                  border: user?.role === 'RESTAURANT_STAFF' ? '2px solid var(--primary)' : undefined,
                }}
                onClick={() => {
                  quickDemoLogin('RESTAURANT_STAFF');
                  setShowRoleModal(false);
                }}
              >
                <div style={{ backgroundColor: 'var(--warning-light)', color: '#b45309', padding: '10px', borderRadius: '50%' }}>
                  <Store size={20} />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: '15px' }}>2. Restaurant Staff (Chef Marco)</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Kitchen live order Kanban board, accept/prepare dishes, manage menu</div>
                </div>
              </button>

              <button
                className="card card-interactive"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 18px',
                  border: user?.role === 'DELIVERY_PARTNER' ? '2px solid var(--primary)' : undefined,
                }}
                onClick={() => {
                  quickDemoLogin('DELIVERY_PARTNER');
                  setShowRoleModal(false);
                }}
              >
                <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-hover)', padding: '10px', borderRadius: '50%' }}>
                  <Bike size={20} />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: '15px' }}>3. Delivery Partner (David Miller)</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Accept trip tasks, 4-stage status updates, map telemetry & earnings</div>
                </div>
              </button>

              <button
                className="card card-interactive"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 18px',
                  border: user?.role === 'ADMIN' ? '2px solid var(--primary)' : undefined,
                }}
                onClick={() => {
                  quickDemoLogin('ADMIN');
                  setShowRoleModal(false);
                }}
              >
                <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '10px', borderRadius: '50%' }}>
                  <ShieldCheck size={20} />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: '15px' }}>4. Administrator (Sarah Connor)</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Revenue analytics, user roles, restaurant moderation, coupons & disputes</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
