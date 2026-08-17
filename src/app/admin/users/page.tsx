'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Shield,
  Trash2,
  Edit2,
  ArrowLeft,
  UserCheck,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (roleFilter !== 'ALL') params.set('role', roleFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      console.error('Error changing role:', err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to permanently delete this user account?')) return;
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
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
          <h1 style={{ fontSize: '28px', fontWeight: 800 }}>User Accounts & Roles</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Manage permissions across Customer, Restaurant Staff, Delivery Fleet, and Platform Admins.
          </p>
        </div>

        {/* Filter bar */}
        <div
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '24px',
            padding: '16px 20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              className="form-input"
              style={{ border: 'none', padding: '6px 0' }}
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {['ALL', 'CUSTOMER', 'RESTAURANT_STAFF', 'DELIVERY_PARTNER', 'ADMIN'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`btn btn-sm ${roleFilter === r ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '12px', borderRadius: 'var(--radius-full)' }}
              >
                {r.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--secondary-subtle)', borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>User Name & Email</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Phone</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Role Class</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Activity</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Registered</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--primary-light)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                          }}
                        >
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <strong>{u.name}</strong>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '13px' }}>
                      {u.phone || 'N/A'}
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="form-select"
                        style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          fontWeight: 700,
                          width: 'auto',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        <option value="CUSTOMER">Customer</option>
                        <option value="RESTAURANT_STAFF">Restaurant Staff</option>
                        <option value="DELIVERY_PARTNER">Delivery Partner</option>
                        <option value="ADMIN">Administrator</option>
                      </select>
                    </td>

                    <td style={{ padding: '14px 20px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      {u._count.orders} orders • {u._count.reviews} reviews
                    </td>

                    <td style={{ padding: '14px 20px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <button
                        className="btn btn-danger btn-sm"
                        style={{ padding: '4px 8px' }}
                        disabled={u.id === currentUser?.id}
                        onClick={() => handleDeleteUser(u.id)}
                        title="Delete User"
                      >
                        <Trash2 size={13} />
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
