'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  Star,
  Clock,
  Bike,
  Plus,
  Minus,
  ArrowLeft,
  Leaf,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

interface MenuItemType {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  isVeg: boolean;
  isAvailable: boolean;
  calories?: number | null;
  prepTime?: string | null;
}

interface CategorizedGroup {
  category: string;
  items: MenuItemType[];
}

export default function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const { items: cartItems, addToCart, updateQuantity } = useCart();

  const [restaurant, setRestaurant] = useState<any>(null);
  const [menuCategories, setMenuCategories] = useState<CategorizedGroup[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [vegOnly, setVegOnly] = useState(false);

  const fetchRestaurantData = async () => {
    try {
      const res = await fetch(`/api/restaurants/${id}`);
      if (res.ok) {
        const data = await res.json();
        setRestaurant(data.restaurant);
        setMenuCategories(data.categorizedMenu || []);
        setReviews(data.restaurant.reviews || []);
        if (data.categorizedMenu?.length > 0) {
          setActiveCategory(data.categorizedMenu[0].category);
        }
      }
    } catch (err) {
      console.error('Error fetching restaurant:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurantData();
  }, [id]);

  const getItemQuantityInCart = (menuItemId: string) => {
    const found = cartItems.find((ci) => ci.menuItemId === menuItemId);
    return found ? found.quantity : 0;
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading restaurant menu...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Restaurant Not Found</h2>
        <Link href="/" className="btn btn-primary" style={{ marginTop: '16px' }}>
          Back to Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Restaurant Header Hero with Dark Glass Sheen */}
      <section
        style={{
          position: 'relative',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '48px 0 56px',
          backgroundImage: restaurant.bannerImage
            ? `linear-gradient(to bottom, rgba(15, 23, 42, 0.82), rgba(15, 23, 42, 0.94)), url(${restaurant.bannerImage})`
            : 'linear-gradient(135deg, #1e293b, #0f172a)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container">
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#94a3b8',
              fontSize: '13px',
              fontWeight: 700,
              marginBottom: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <ArrowLeft size={16} /> Back to all restaurants
          </Link>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '24px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span className="badge badge-primary">{restaurant.cuisineType}</span>
                <span className="badge badge-success">● Open Now</span>
              </div>
              <h1 style={{ fontSize: '38px', color: '#ffffff', marginBottom: '8px', letterSpacing: '-0.03em' }}>
                {restaurant.name}
              </h1>
              <p style={{ color: '#cbd5e1', fontSize: '14px', maxWidth: '640px', lineHeight: '1.5', marginBottom: '16px' }}>
                {restaurant.description}
              </p>
              <p style={{ color: '#94a3b8', fontSize: '13px' }}>
                📍 {restaurant.address}, {restaurant.city}
              </p>
            </div>

            {/* Frosted Glass Metrics Capsule */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderRadius: 'var(--radius-xl)',
                padding: '20px 28px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 16px 36px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
                display: 'flex',
                gap: '28px',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#f59e0b', fontWeight: 800, fontSize: '22px' }}>
                  <Star size={20} fill="#f59e0b" /> {restaurant.rating.toFixed(1)}
                </div>
                <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '2px', fontWeight: 600 }}>
                  {restaurant.ratingCount} reviews
                </div>
              </div>

              <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.2)', paddingLeft: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '18px' }}>
                  <Clock size={18} color="var(--primary)" /> {restaurant.deliveryTime}
                </div>
                <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '2px', fontWeight: 600 }}>
                  Delivery Time
                </div>
              </div>

              <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.2)', paddingLeft: '28px' }}>
                <div style={{ fontWeight: 800, fontSize: '18px' }}>
                  ${restaurant.deliveryFee.toFixed(2)}
                </div>
                <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '2px', fontWeight: 600 }}>
                  Delivery Fee
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Translucent Menu Categories Bar */}
      <section
        style={{
          position: 'sticky',
          top: '76px',
          zIndex: 40,
          backgroundColor: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--glass-border)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: '8px', padding: '14px 0' }}>
            {menuCategories.map((group) => {
              const active = activeCategory === group.category;
              return (
                <button
                  key={group.category}
                  onClick={() => setActiveCategory(group.category)}
                  className={`btn btn-sm ${active ? 'btn-primary' : 'btn-outline'}`}
                  style={{
                    borderRadius: 'var(--radius-full)',
                    fontSize: '13px',
                    fontWeight: 700,
                  }}
                >
                  {group.category} ({group.items.length})
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setVegOnly(!vegOnly)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: vegOnly ? '1.5px solid var(--veg-color)' : '1px solid var(--glass-border)',
              backgroundColor: vegOnly ? 'var(--success-light)' : 'var(--glass-bg-subtle)',
              backdropFilter: 'blur(8px)',
              color: vegOnly ? '#047857' : 'var(--text-main)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: 'var(--glass-shadow-sm)',
            }}
          >
            <Leaf size={14} color={vegOnly ? '#047857' : 'var(--veg-color)'} /> Pure Veg
          </button>
        </div>
      </section>

      {/* Menu Dishes List */}
      <section style={{ padding: '40px 0 80px' }}>
        <div className="container">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            {menuCategories
              .filter((group) => !activeCategory || group.category === activeCategory)
              .map((group) => {
                const itemsToDisplay = group.items.filter((item) =>
                  vegOnly ? item.isVeg : true
                );

                if (itemsToDisplay.length === 0) return null;

                return (
                  <div key={group.category}>
                    <h2
                      style={{
                        fontSize: '24px',
                        fontWeight: 800,
                        marginBottom: '20px',
                        paddingBottom: '8px',
                        borderBottom: '2px solid rgba(249, 115, 22, 0.4)',
                        display: 'inline-block',
                      }}
                    >
                      {group.category}
                    </h2>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                        gap: '20px',
                      }}
                    >
                      {itemsToDisplay.map((item) => {
                        const qtyInCart = getItemQuantityInCart(item.id);
                        return (
                          <div
                            key={item.id}
                            className="card"
                            style={{
                              padding: '18px',
                              display: 'flex',
                              gap: '16px',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            {/* Left Info */}
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                <span
                                  className={`diet-badge ${
                                    item.isVeg ? 'diet-veg' : 'diet-nonveg'
                                  }`}
                                />
                                <h4 style={{ fontSize: '16px', fontWeight: 800 }}>
                                  {item.name}
                                </h4>
                              </div>

                              <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-main)', marginBottom: '6px' }}>
                                ${item.price.toFixed(2)}
                              </div>

                              <p
                                style={{
                                  fontSize: '13px',
                                  color: 'var(--text-muted)',
                                  lineHeight: '1.45',
                                  marginBottom: '8px',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {item.description}
                              </p>

                              <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: 'var(--text-light)', fontWeight: 600 }}>
                                {item.calories && <span>🔥 {item.calories} kcal</span>}
                                {item.prepTime && <span>⏱️ {item.prepTime}</span>}
                              </div>
                            </div>

                            {/* Right Image & Add Button */}
                            <div style={{ position: 'relative', width: '114px', height: '114px', flexShrink: 0 }}>
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  borderRadius: 'var(--radius-md)',
                                  boxShadow: 'var(--glass-shadow-sm)',
                                  border: '1px solid rgba(255, 255, 255, 0.8)',
                                }}
                              />

                              <div
                                style={{
                                  position: 'absolute',
                                  bottom: '-10px',
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                }}
                              >
                                {qtyInCart > 0 ? (
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                      backdropFilter: 'blur(8px)',
                                      border: '1.5px solid var(--primary)',
                                      borderRadius: 'var(--radius-full)',
                                      boxShadow: 'var(--glass-shadow-primary)',
                                      padding: '2px 4px',
                                    }}
                                  >
                                    <button
                                      onClick={() => updateQuantity(item.id, qtyInCart - 1)}
                                      style={{
                                        border: 'none',
                                        background: 'none',
                                        padding: '4px 6px',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      <Minus size={13} color="var(--primary)" />
                                    </button>
                                    <span style={{ fontSize: '13px', fontWeight: 800, padding: '0 6px' }}>
                                      {qtyInCart}
                                    </span>
                                    <button
                                      onClick={() => updateQuantity(item.id, qtyInCart + 1)}
                                      style={{
                                        border: 'none',
                                        background: 'none',
                                        padding: '4px 6px',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      <Plus size={13} color="var(--primary)" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() =>
                                      addToCart({ ...item, restaurant: { ...restaurant } })
                                    }
                                    style={{
                                      padding: '5px 16px',
                                      fontSize: '12px',
                                      fontWeight: 800,
                                    }}
                                  >
                                    ADD <Plus size={12} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Customer Reviews Section */}
          <div style={{ marginTop: '60px', borderTop: '1px solid var(--glass-border)', paddingTop: '40px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '20px' }}>
              Customer Reviews ({reviews.length})
            </h3>

            {reviews.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                No reviews yet. Be the first to order and review!
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
                {reviews.map((r) => (
                  <div key={r.id} className="card" style={{ padding: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ fontWeight: 800, fontSize: '14px' }}>
                        {r.user?.name || 'Verified Foodie'}
                      </div>
                      <div style={{ display: 'flex', gap: '2px', color: '#f59e0b' }}>
                        {[...Array(r.rating)].map((_, i) => (
                          <Star key={i} size={13} fill="#f59e0b" />
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.45' }}>
                      "{r.comment}"
                    </p>
                    <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '8px', fontWeight: 600 }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
