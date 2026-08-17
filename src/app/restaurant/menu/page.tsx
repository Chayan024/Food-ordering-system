'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  UtensilsCrossed,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Image as ImageIcon,
  Flame,
  Leaf,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function RestaurantMenuPage() {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add/Edit Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Mains',
    imageUrl: '',
    isVeg: false,
    isAvailable: true,
    calories: '',
    prepTime: '15 mins',
  });
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRestaurantAndMenu = async () => {
    try {
      const res = await fetch('/api/restaurant/orders');
      if (res.ok) {
        const data = await res.json();
        if (data.restaurant) {
          setRestaurant(data.restaurant);
          const menuRes = await fetch(`/api/restaurants/${data.restaurant.id}`);
          if (menuRes.ok) {
            const mData = await menuRes.json();
            setMenuItems(mData.restaurant.menuItems || []);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching menu items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurantAndMenu();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Mains',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
      isVeg: false,
      isAvailable: true,
      calories: '450',
      prepTime: '15 mins',
    });
    setModalError('');
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      imageUrl: item.imageUrl,
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
      calories: item.calories ? item.calories.toString() : '',
      prepTime: item.prepTime || '15 mins',
    });
    setModalError('');
    setShowModal(true);
  };

  const toggleAvailability = async (item: any) => {
    try {
      const res = await fetch(`/api/menu/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      });
      if (res.ok) {
        setMenuItems((prev) =>
          prev.map((m) => (m.id === item.id ? { ...m, isAvailable: !m.isAvailable } : m))
        );
      }
    } catch (err) {
      console.error('Error toggling availability:', err);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    try {
      const res = await fetch(`/api/menu/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMenuItems((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;

    setSubmitting(true);
    setModalError('');

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        imageUrl: formData.imageUrl,
        isVeg: formData.isVeg,
        isAvailable: formData.isAvailable,
        calories: formData.calories ? parseInt(formData.calories) : undefined,
        prepTime: formData.prepTime,
      };

      let res;
      if (editingItem) {
        res = await fetch(`/api/menu/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/restaurants/${restaurant.id}/menu`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        setModalError(data.error || 'Failed to save menu item');
      } else {
        setShowModal(false);
        await fetchRestaurantAndMenu();
      }
    } catch (err: any) {
      setModalError(err.message || 'Error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '36px 0 80px' }}>
      <div className="container">
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '28px',
          }}
        >
          <div>
            <Link
              href="/restaurant/dashboard"
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
              <ArrowLeft size={16} /> Back to Kitchen Dashboard
            </Link>
            <h1 style={{ fontSize: '28px', fontWeight: 800 }}>
              Menu Management ({restaurant?.name || 'My Restaurant'})
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Add new dishes, update pricing, customize ingredients, and manage stock.
            </p>
          </div>

          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={18} /> Add New Dish
          </button>
        </div>

        {/* Menu Items Table / Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="card"
              style={{
                padding: '16px',
                display: 'flex',
                gap: '14px',
                opacity: item.isAvailable ? 1 : 0.65,
                borderLeft: item.isAvailable ? '4px solid var(--success)' : '4px solid var(--danger)',
              }}
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: 'var(--radius-md)',
                  objectFit: 'cover',
                }}
              />

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className={`diet-badge ${item.isVeg ? 'diet-veg' : 'diet-nonveg'}`} />
                    <strong style={{ fontSize: '15px' }}>{item.name}</strong>
                  </div>
                  <span className="badge badge-primary" style={{ fontSize: '10px' }}>
                    {item.category}
                  </span>
                </div>

                <div style={{ fontWeight: 800, fontSize: '14px', margin: '4px 0', color: 'var(--text-main)' }}>
                  ${item.price.toFixed(2)}
                </div>

                <p
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    lineHeight: '1.3',
                    marginBottom: '10px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {item.description}
                </p>

                {/* Bottom Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                  <button
                    onClick={() => toggleAvailability(item)}
                    style={{
                      border: 'none',
                      background: 'none',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: item.isAvailable ? 'var(--success)' : 'var(--danger)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {item.isAvailable ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                  </button>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ padding: '4px 8px' }}
                      onClick={() => openEditModal(item)}
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ padding: '4px 8px' }}
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="modal-backdrop" onClick={() => setShowModal(false)}>
            <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>

              {modalError && (
                <div style={{ padding: '10px', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '14px', fontSize: '13px' }}>
                  {modalError}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Dish Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Truffle Mushroom Fettuccine"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="form-input"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="14.99"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Pizzas, Pastas, Mains, Desserts..."
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    rows={2}
                    required
                    className="form-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe flavor notes, toppings, and preparation style..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Dish Image URL</label>
                  <input
                    type="url"
                    required
                    className="form-input"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Prep Time</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.prepTime}
                      onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                      placeholder="15 mins"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Calories (kcal)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.calories}
                      onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                      placeholder="650"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', margin: '14px 0 20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.isVeg}
                      onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                    />
                    Vegetarian Dish (Veg)
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.isAvailable}
                      onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    />
                    In Stock / Available
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save Dish'}
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
