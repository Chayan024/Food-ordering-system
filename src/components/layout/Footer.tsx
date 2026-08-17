'use client';

import React from 'react';
import { UtensilsCrossed, Shield, Clock, Heart, Award } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer
      style={{
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        padding: '60px 0 30px',
        marginTop: '80px',
        borderTop: '1px solid #1e293b',
      }}
    >
      <div className="container-wide">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '40px',
            marginBottom: '50px',
          }}
        >
          {/* Col 1 */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--primary)',
                fontSize: '22px',
                fontWeight: 800,
                marginBottom: '14px',
              }}
            >
              <UtensilsCrossed size={22} />
              <span>FlavorDash</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>
              Full-Stack Online Food Ordering System built for multi-role operations: Customers, Kitchen Staff, Delivery Fleet, and Platform Admins.
            </p>
            <div
              style={{
                display: 'flex',
                gap: '12px',
                marginTop: '16px',
                color: '#38bdf8',
                fontSize: '13px',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Shield size={14} /> 256-Bit SSL
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} /> Real-time ETA
              </span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '15px', marginBottom: '16px' }}>
              Portals & Roles
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#94a3b8' }}>
              <li>
                <Link href="/">Customer Discovery</Link>
              </li>
              <li>
                <Link href="/restaurant/dashboard">Restaurant Kitchen Board</Link>
              </li>
              <li>
                <Link href="/delivery/dashboard">Delivery Driver Portal</Link>
              </li>
              <li>
                <Link href="/admin">Administrator Control Center</Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '15px', marginBottom: '16px' }}>
              Popular Cuisines
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#94a3b8' }}>
              <li>Italian Pizzas & Handcrafted Pasta</li>
              <li>Royal Hyderabadi Dum Biryani</li>
              <li>Authentic Japanese Tonkotsu Ramen</li>
              <li>Artisanal Gourmet Smash Burgers</li>
              <li>Organic Plant-Based Power Bowls</li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '15px', marginBottom: '16px' }}>
              System Compliance
            </h4>
            <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.6' }}>
              Complies with all SRS functional requirements (FR-01 to FR-14) including Role-based Access Control, Payment Gateway idempotency, and GPS live order tracking.
            </p>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid #1e293b',
            paddingTop: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            color: '#64748b',
            fontSize: '13px',
          }}
        >
          <div>© 2026 FlavorDash Online Food Ordering System. All rights reserved.</div>
          <div>Built with Next.js 15, Prisma ORM, TypeScript & Vanilla CSS</div>
        </div>
      </div>
    </footer>
  );
}
