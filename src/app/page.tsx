'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Star,
  Clock,
  Bike,
  Flame,
  Leaf,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface RestaurantItem {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  cuisineType: string;
  rating: number;
  ratingCount: number;
  image: string;
  bannerImage?: string | null;
  isOpen: boolean;
  deliveryFee: number;
  minOrder: number;
  deliveryTime: string;
}

const CUISINE_PILLS = [
  { label: 'All', icon: '🍽️' },
  { label: 'Italian', icon: '🍕' },
  { label: 'Indian', icon: '🍛' },
  { label: 'Japanese', icon: '🍜' },
  { label: 'Burgers', icon: '🍔' },
  { label: 'Healthy & Vegan', icon: '🥗' },
  { label: 'Mexican', icon: '🌮' },
];

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<RestaurantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [vegOnly, setVegOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('recommended');

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (selectedCuisine !== 'All') params.set('cuisine', selectedCuisine);
      if (vegOnly) params.set('veg', 'true');
      if (minRating > 0) params.set('rating', minRating.toString());
      if (sortBy) params.set('sort', sortBy);

      const res = await fetch(`/api/restaurants?${params.toString()}`);
      const data = await res.json();
      setRestaurants(data.restaurants || []);
    } catch (err) {
      console.error('Error loading restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [selectedCuisine, vegOnly, minRating, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRestaurants();
  };

  return (
    <div>
      {/* Hero Section with Liquid Glass Glow */}
      <section
        style={{
          position: 'relative',
          padding: '70px 0 80px',
          overflow: 'hidden',
        }}
      >
        <div className="container">
          <div style={{ maxWidth: '740px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                padding: '6px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: '13px',
                fontWeight: 800,
                color: 'var(--primary-hover)',
                boxShadow: 'var(--glass-shadow-sm)',
                marginBottom: '20px',
              }}
            >
              <Flame size={16} color="var(--primary)" /> 30-Minute Guaranteed Express Delivery
            </div>

            <h1
              style={{
                fontSize: '48px',
                lineHeight: '1.15',
                marginBottom: '18px',
                color: '#0f172a',
                letterSpacing: '-0.03em',
              }}
            >
              Artisanal Flavors,{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Delivered in Style.
              </span>
            </h1>
            <p
              style={{
                fontSize: '16px',
                color: '#475569',
                marginBottom: '36px',
                lineHeight: '1.6',
              }}
            >
              Explore gourmet woodfired pizzas, aromatic dum biryanis, authentic ramen, handcrafted smash burgers, and fresh vitality bowls.
            </p>

            {/* Liquid Glass Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              style={{
                display: 'flex',
                backgroundColor: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: 'var(--radius-full)',
                padding: '8px 10px',
                boxShadow: 'var(--glass-shadow-lg)',
                border: '1px solid rgba(255, 255, 255, 0.9)',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div style={{ paddingLeft: '16px', color: 'var(--primary)' }}>
                <Search size={22} />
              </div>
              <input
                type="text"
                placeholder="Search restaurants, cuisines, or dishes (e.g. Truffle Fettuccine, Biryani)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '15px',
                  backgroundColor: 'transparent',
                  color: 'var(--text-main)',
                }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '12px 28px' }}
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Category Pills Carousel with Liquid Frosted Glass */}
      <section style={{ padding: '16px 0 24px' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              gap: '12px',
              overflowX: 'auto',
              paddingBottom: '8px',
              scrollbarWidth: 'none',
            }}
          >
            {CUISINE_PILLS.map((pill) => {
              const active = selectedCuisine === pill.label;
              return (
                <button
                  key={pill.label}
                  onClick={() => setSelectedCuisine(pill.label)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    borderRadius: 'var(--radius-full)',
                    border: active
                      ? '1.5px solid var(--primary)'
                      : '1px solid var(--glass-border)',
                    backgroundColor: active
                      ? 'rgba(254, 215, 170, 0.65)'
                      : 'var(--glass-bg-subtle)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    color: active ? '#c2410c' : 'var(--text-main)',
                    fontWeight: active ? 800 : 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: active
                      ? 'var(--glass-shadow-primary)'
                      : 'var(--glass-shadow-sm)',
                    transition: 'var(--transition)',
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{pill.icon}</span>
                  <span>{pill.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Area: Filters & Restaurant Grid */}
      <section style={{ padding: '30px 0 80px' }}>
        <div className="container">
          {/* Controls Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '32px',
            }}
          >
            <div>
              <h2 style={{ fontSize: '26px', fontWeight: 800 }}>
                {selectedCuisine === 'All' ? 'Top Rated Culinary Kitchens' : `${selectedCuisine} Kitchens`}
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Showing {restaurants.length} spots in Metropolis
              </p>
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* Veg Only Toggle */}
              <button
                onClick={() => setVegOnly(!vegOnly)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  border: vegOnly
                    ? '1.5px solid var(--veg-color)'
                    : '1px solid var(--glass-border)',
                  backgroundColor: vegOnly ? 'var(--success-light)' : 'var(--glass-bg-subtle)',
                  backdropFilter: 'blur(8px)',
                  color: vegOnly ? '#047857' : 'var(--text-main)',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: 'var(--glass-shadow-sm)',
                }}
              >
                <Leaf size={14} color={vegOnly ? '#047857' : 'var(--veg-color)'} />
                Pure Veg
              </button>

              {/* 4.0+ Star Filter */}
              <button
                onClick={() => setMinRating(minRating === 4.0 ? 0 : 4.0)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  border: minRating === 4.0
                    ? '1.5px solid var(--primary)'
                    : '1px solid var(--glass-border)',
                  backgroundColor: minRating === 4.0 ? 'rgba(254, 215, 170, 0.6)' : 'var(--glass-bg-subtle)',
                  backdropFilter: 'blur(8px)',
                  color: minRating === 4.0 ? 'var(--primary-hover)' : 'var(--text-main)',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: 'var(--glass-shadow-sm)',
                }}
              >
                <Star size={14} color="#f59e0b" fill="#f59e0b" />
                Rating 4.0+
              </button>

              {/* Sort By Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-select"
                style={{
                  width: 'auto',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-full)',
                }}
              >
                <option value="recommended">Sort: Recommended</option>
                <option value="rating">Sort: Highest Rating</option>
                <option value="deliveryFee">Sort: Lowest Delivery Fee</option>
                <option value="minOrder">Sort: Lowest Minimum Order</option>
              </select>
            </div>
          </div>

          {/* Restaurant Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div
                style={{
                  display: 'inline-block',
                  width: '44px',
                  height: '44px',
                  border: '4px solid var(--primary-light)',
                  borderTopColor: 'var(--primary)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>
                Discovering best kitchens near you...
              </p>
            </div>
          ) : restaurants.length === 0 ? (
            <div
              className="card"
              style={{
                textAlign: 'center',
                padding: '60px 20px',
              }}
            >
              <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>
                No restaurants match your filters
              </h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
                Try adjusting your search terms or clearing active filters.
              </p>
              <button
                className="btn btn-outline"
                onClick={() => {
                  setSearch('');
                  setSelectedCuisine('All');
                  setVegOnly(false);
                  setMinRating(0);
                  setSortBy('recommended');
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '28px',
              }}
            >
              {restaurants.map((rest) => (
                <Link
                  key={rest.id}
                  href={`/restaurant/${rest.id}`}
                  className="card card-interactive"
                  style={{
                    padding: '0',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    textDecoration: 'none',
                  }}
                >
                  {/* Restaurant Image Banner */}
                  <div
                    style={{
                      position: 'relative',
                      height: '200px',
                      backgroundColor: 'var(--bg-muted)',
                      backgroundImage: `url(${rest.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(15, 23, 42, 0.75) 0%, transparent 60%)',
                      }}
                    />

                    {/* Delivery Time Badge */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '12px',
                        left: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.85)',
                        backdropFilter: 'blur(10px)',
                        padding: '5px 12px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '12px',
                        fontWeight: 800,
                        color: 'var(--text-main)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        boxShadow: 'var(--glass-shadow-sm)',
                        border: '1px solid rgba(255, 255, 255, 0.8)',
                      }}
                    >
                      <Clock size={13} color="var(--primary)" /> {rest.deliveryTime}
                    </div>

                    {/* Rating Badge */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        backgroundColor: 'rgba(16, 185, 129, 0.85)',
                        backdropFilter: 'blur(10px)',
                        color: '#ffffff',
                        padding: '5px 12px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '12px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                      }}
                    >
                      <Star size={12} fill="#ffffff" /> {rest.rating.toFixed(1)}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '20px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                        {rest.name}
                      </h3>
                      <span className="badge badge-primary" style={{ fontSize: '11px' }}>
                        {rest.cuisineType}
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: '13px',
                        color: 'var(--text-muted)',
                        lineHeight: '1.45',
                        marginBottom: '16px',
                        flex: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {rest.description}
                    </p>

                    <div
                      style={{
                        borderTop: '1px solid var(--glass-border-subtle)',
                        paddingTop: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '13px',
                        color: 'var(--text-muted)',
                        fontWeight: 600,
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Bike size={15} color="var(--primary)" /> Delivery: ${rest.deliveryFee.toFixed(2)}
                      </span>
                      <span>Min: ${rest.minOrder.toFixed(2)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Feature Value Highlights with Liquid Glass Surfaces */}
      <section style={{ padding: '40px 0 80px' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
            }}
          >
            <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div
                style={{
                  backgroundColor: 'rgba(254, 215, 170, 0.7)',
                  color: 'var(--primary)',
                  padding: '12px',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--glass-shadow-sm)',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                }}
              >
                <Zap size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>Lightning Delivery</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  Smart GPS routing and dedicated delivery fleet to get your meals steaming hot in under 35 mins.
                </p>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div
                style={{
                  backgroundColor: 'rgba(209, 250, 229, 0.7)',
                  color: '#047857',
                  padding: '12px',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--glass-shadow-sm)',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                }}
              >
                <Sparkles size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>Curated Kitchens</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  Every restaurant undergoes strict culinary quality and hygiene verification before onboarding.
                </p>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div
                style={{
                  backgroundColor: 'rgba(219, 234, 254, 0.7)',
                  color: '#1d4ed8',
                  padding: '12px',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--glass-shadow-sm)',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                }}
              >
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>Zero-Risk Payments</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  Idempotent payment security supporting instant UPI, Credit Cards, Netbanking, and Cash on Delivery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
