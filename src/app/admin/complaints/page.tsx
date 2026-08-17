'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  DollarSign,
  ExternalLink,
} from 'lucide-react';

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);
  const [resolutionText, setResolutionText] = useState('');
  const [newStatus, setNewStatus] = useState('RESOLVED');
  const [submitting, setSubmitting] = useState(false);

  const fetchComplaints = async () => {
    try {
      const res = await fetch('/api/admin/complaints');
      if (res.ok) {
        const data = await res.json();
        setComplaints(data.complaints || []);
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const openResolveModal = (complaint: any) => {
    setSelectedComplaint(complaint);
    setResolutionText(
      complaint.resolution ||
        'We sincerely apologize for the inconvenience. A $5 coupon voucher has been issued and credited to your account.'
    );
    setNewStatus('RESOLVED');
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/complaints', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaintId: selectedComplaint.id,
          status: newStatus,
          resolution: resolutionText,
        }),
      });

      if (res.ok) {
        setSelectedComplaint(null);
        await fetchComplaints();
      }
    } catch (err) {
      console.error('Error resolving complaint:', err);
    } finally {
      setSubmitting(false);
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
          <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Customer Support & Dispute Desk</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Investigate customer complaints, issue resolutions, and notify customers.
          </p>
        </div>

        {/* Complaints Table */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--secondary-subtle)', borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Ticket & Subject</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Customer Info</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Order #</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Restaurant</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Date</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No support tickets logged.
                    </td>
                  </tr>
                ) : (
                  complaints.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <strong>{c.subject}</strong>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '300px', marginTop: '2px' }}>
                          "{c.description}"
                        </p>
                        {c.resolution && (
                          <div style={{ fontSize: '11px', color: 'var(--success)', marginTop: '4px', fontStyle: 'italic' }}>
                            ✓ Resolution: {c.resolution}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '14px 20px', fontSize: '13px' }}>
                        <div><strong>{c.customer.name}</strong></div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{c.customer.email}</div>
                      </td>

                      <td style={{ padding: '14px 20px', fontSize: '13px' }}>
                        <Link
                          href={`/orders/${c.orderId}`}
                          style={{ color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                          target="_blank"
                        >
                          #{c.order.orderNumber} <ExternalLink size={11} />
                        </Link>
                      </td>

                      <td style={{ padding: '14px 20px', fontSize: '13px' }}>
                        {c.order.restaurant.name}
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        <span
                          className={`badge ${
                            c.status === 'RESOLVED'
                              ? 'badge-success'
                              : c.status === 'IN_PROGRESS'
                              ? 'badge-warning'
                              : 'badge-danger'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>

                      <td style={{ padding: '14px 20px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>

                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '12px' }}
                          onClick={() => openResolveModal(c)}
                        >
                          {c.status === 'RESOLVED' ? 'Update' : 'Resolve Ticket'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resolve Modal */}
        {selectedComplaint && (
          <div className="modal-backdrop" onClick={() => setSelectedComplaint(null)}>
            <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
                Resolve Customer Support Dispute
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Ticket from <strong>{selectedComplaint.customer.name}</strong> regarding Order #{selectedComplaint.order.orderNumber}.
              </p>

              <div style={{ backgroundColor: 'var(--bg-main)', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '13px' }}>
                <strong>Issue Reported:</strong> {selectedComplaint.subject}
                <p style={{ marginTop: '4px', color: 'var(--text-muted)' }}>"{selectedComplaint.description}"</p>
              </div>

              <form onSubmit={handleResolveSubmit}>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Resolution Notes / Action Taken</label>
                  <textarea
                    rows={3}
                    required
                    className="form-textarea"
                    value={resolutionText}
                    onChange={(e) => setResolutionText(e.target.value)}
                    placeholder="Explain how the issue was resolved (e.g. refund issued, discount code sent)..."
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setSelectedComplaint(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Send Resolution to Customer'}
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
