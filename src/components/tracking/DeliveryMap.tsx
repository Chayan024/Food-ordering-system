'use client';

import React, { useEffect, useState } from 'react';
import { Store, Home, Bike, Navigation, Clock, MapPin } from 'lucide-react';

interface DeliveryMapProps {
  orderNumber: string;
  restaurant: {
    name: string;
    address: string;
    coords: { lat: number; lng: number };
  };
  customer: {
    address: string;
    phone: string;
    coords: { lat: number; lng: number };
  };
  driver: {
    name: string;
    phone?: string | null;
    avatar?: string | null;
  } | null;
  status: string;
  distanceKm: number;
  etaMinutes: number;
}

export function DeliveryMap({
  orderNumber,
  restaurant,
  customer,
  driver,
  status,
  distanceKm,
  etaMinutes,
}: DeliveryMapProps) {
  const [driverProgress, setDriverProgress] = useState(
    status === 'DELIVERED'
      ? 100
      : status === 'OUT_FOR_DELIVERY'
      ? 55
      : status === 'READY_FOR_PICKUP'
      ? 15
      : 5
  );

  useEffect(() => {
    if (status === 'OUT_FOR_DELIVERY') {
      const interval = setInterval(() => {
        setDriverProgress((prev) => (prev >= 90 ? 30 : prev + 2));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const startX = 70;
  const startY = 240;
  const endX = 530;
  const endY = 80;

  const ctrlX = 280;
  const ctrlY = 60;

  const t = driverProgress / 100;
  const driverX = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * ctrlX + t * t * endX;
  const driverY = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * ctrlY + t * t * endY;

  return (
    <div
      style={{
        backgroundColor: 'var(--glass-bg-card)',
        backdropFilter: 'blur(var(--blur-lg))',
        WebkitBackdropFilter: 'blur(var(--blur-lg))',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: 'var(--glass-shadow-lg)',
      }}
    >
      {/* Map Glass Header */}
      <div
        style={{
          padding: '16px 22px',
          borderBottom: '1px solid var(--glass-border-subtle)',
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              backgroundColor: 'rgba(254, 215, 170, 0.7)',
              color: 'var(--primary)',
              padding: '8px',
              borderRadius: '12px',
              boxShadow: 'var(--glass-shadow-sm)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
            }}
          >
            <Navigation size={18} />
          </div>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 800 }}>Live GPS Route Simulation</h4>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Order #{orderNumber} • {distanceKm} km trip
            </span>
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--success-light)',
            color: '#065f46',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '13px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            boxShadow: 'var(--glass-shadow-sm)',
          }}
        >
          <Clock size={14} /> ETA: {status === 'DELIVERED' ? 'Delivered' : `${etaMinutes} mins`}
        </div>
      </div>

      {/* Interactive Liquid City Grid Canvas */}
      <div
        style={{
          position: 'relative',
          height: '320px',
          backgroundColor: '#eef2f6',
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.08) 0%, transparent 60%),
            linear-gradient(to right, rgba(203, 213, 225, 0.5) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(203, 213, 225, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 36px 36px, 36px 36px',
          overflow: 'hidden',
        }}
      >
        <svg
          viewBox="0 0 600 320"
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          {/* Secondary road network grid */}
          <path
            d="M 20 120 Q 200 180 580 140"
            stroke="rgba(255, 255, 255, 0.7)"
            strokeWidth="8"
            fill="none"
          />
          <path
            d="M 120 30 Q 150 200 480 300"
            stroke="rgba(255, 255, 255, 0.7)"
            strokeWidth="8"
            fill="none"
          />

          {/* Main Delivery Route Highway */}
          <path
            d={`M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`}
            stroke="rgba(203, 213, 225, 0.8)"
            strokeWidth="12"
            strokeLinecap="round"
            fill="none"
          />
          {/* Glowing Liquid Route */}
          <path
            d={`M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`}
            stroke="#f97316"
            strokeWidth="5"
            strokeDasharray="10,6"
            strokeLinecap="round"
            fill="none"
            filter="drop-shadow(0 0 6px rgba(249, 115, 22, 0.7))"
          />

          {/* Start Point: Restaurant */}
          <g transform={`translate(${startX}, ${startY})`}>
            <circle r="22" fill="rgba(254, 215, 170, 0.9)" />
            <circle r="14" fill="#ea580c" />
            <circle r="6" fill="#ffffff" />
          </g>

          {/* End Point: Customer Home */}
          <g transform={`translate(${endX}, ${endY})`}>
            <circle r="22" fill="rgba(209, 250, 229, 0.9)" />
            <circle r="14" fill="#10b981" />
            <circle r="6" fill="#ffffff" />
          </g>

          {/* Moving Driver Marker with Liquid Halo */}
          <g transform={`translate(${driverX}, ${driverY})`}>
            <circle r="24" fill="rgba(249, 115, 22, 0.25)" />
            <circle r="16" fill="#0f172a" />
            <circle r="12" fill="#f97316" />
          </g>
        </svg>

        {/* Floating Glass Start Pin Label */}
        <div
          style={{
            position: 'absolute',
            left: `${(startX / 600) * 100}%`,
            top: `${(startY / 320) * 100}%`,
            transform: 'translate(-50%, -150%)',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.9)',
            boxShadow: 'var(--glass-shadow)',
            borderRadius: 'var(--radius-md)',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 800,
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            zIndex: 10,
          }}
        >
          <Store size={14} color="#ea580c" /> {restaurant.name}
        </div>

        {/* Floating Glass End Pin Label */}
        <div
          style={{
            position: 'absolute',
            left: `${(endX / 600) * 100}%`,
            top: `${(endY / 320) * 100}%`,
            transform: 'translate(-50%, -150%)',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.9)',
            boxShadow: 'var(--glass-shadow)',
            borderRadius: 'var(--radius-md)',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 800,
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            zIndex: 10,
          }}
        >
          <Home size={14} color="#10b981" /> Delivery Location
        </div>

        {/* Floating Glass Moving Driver Avatar */}
        <div
          style={{
            position: 'absolute',
            left: `${(driverX / 600) * 100}%`,
            top: `${(driverY / 320) * 100}%`,
            transform: 'translate(-50%, -140%)',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(8px)',
            color: '#ffffff',
            boxShadow: '0 8px 24px rgba(249, 115, 22, 0.4)',
            borderRadius: 'var(--radius-full)',
            padding: '5px 12px',
            fontSize: '12px',
            fontWeight: 800,
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            zIndex: 20,
            border: '1.5px solid #f97316',
          }}
        >
          <Bike size={14} color="#f97316" /> {driver ? driver.name : 'Delivery Fleet'}
        </div>
      </div>

      {/* Driver Card */}
      <div
        style={{
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              backgroundColor: 'rgba(254, 215, 170, 0.6)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              boxShadow: 'var(--glass-shadow-sm)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
            }}
          >
            {driver?.name ? driver.name.charAt(0) : 'D'}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '15px' }}>
              {driver ? driver.name : 'Assigning Nearby Driver...'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {driver ? `Contact: ${driver.phone || '+1 (555) 345-6789'}` : 'Looking for available partner'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {driver?.phone && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => alert(`Simulated call to driver: ${driver.phone}`)}
            >
              📞 Call Driver
            </button>
          )}
          <button
            className="btn btn-primary btn-sm"
            onClick={() => alert('Live telemetry: Lat 28.6155, Lng 77.2115. Speed: 24 km/h.')}
          >
            <MapPin size={14} /> Telemetry
          </button>
        </div>
      </div>
    </div>
  );
}
