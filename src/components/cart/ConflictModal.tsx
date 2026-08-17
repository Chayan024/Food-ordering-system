'use client';

import React from 'react';
import { AlertCircle, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export function ConflictModal() {
  const { pendingConflictItem, resolveConflict } = useCart();

  if (!pendingConflictItem) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content animate-fade-in" style={{ maxWidth: '440px' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div
            style={{
              backgroundColor: 'var(--warning-light)',
              color: 'var(--warning)',
              padding: '10px',
              borderRadius: '50%',
            }}
          >
            <AlertCircle size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>
              Replace cart items?
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Your cart currently has dishes from another restaurant. You can only order from one restaurant at a time.
            </p>
          </div>
        </div>

        <div
          style={{
            marginTop: '20px',
            padding: '14px',
            backgroundColor: 'var(--bg-muted)',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
          }}
        >
          <strong>New dish to add:</strong> {pendingConflictItem.menuItem.name} (${pendingConflictItem.menuItem.price.toFixed(2)})
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '24px',
          }}
        >
          <button
            className="btn btn-outline"
            onClick={() => resolveConflict(false)}
          >
            Keep Existing Cart
          </button>
          <button
            className="btn btn-primary"
            onClick={() => resolveConflict(true)}
          >
            <Trash2 size={16} /> Discard & Add New
          </button>
        </div>
      </div>
    </div>
  );
}
