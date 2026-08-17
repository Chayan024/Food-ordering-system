'use client';

import React from 'react';
import { X, Plus, Minus, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export function CartDrawer() {
  const {
    items,
    subtotal,
    itemCount,
    restaurant,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  const router = useRouter();

  if (!isCartOpen) return null;

  const minOrderMet = !restaurant || subtotal >= restaurant.minOrder;
  const remainingForMin = restaurant ? Math.max(0, restaurant.minOrder - subtotal) : 0;

  const handleCheckout = () => {
    closeCart();
    router.push('/checkout');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 150,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={closeCart}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.12), inset 1px 0 1px rgba(255, 255, 255, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 151,
          animation: 'fadeIn 0.25s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                backgroundColor: 'rgba(254, 215, 170, 0.6)',
                color: 'var(--primary)',
                padding: '10px',
                borderRadius: '50%',
                boxShadow: 'var(--glass-shadow-sm)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
              }}
            >
              <ShoppingBag size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, letterSpacing: '-0.02em' }}>Your Feast Cart</h3>
              {restaurant && (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  From {restaurant.name}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={closeCart}
            style={{
              background: 'rgba(255, 255, 255, 0.6)',
              border: '1px solid var(--glass-border-subtle)',
              borderRadius: '50%',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Cart Items List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {items.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '40px 20px',
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(241, 245, 249, 0.7)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-light)',
                  marginBottom: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  boxShadow: 'var(--glass-shadow-sm)',
                }}
              >
                <ShoppingBag size={38} />
              </div>
              <h4 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>
                Your cart is empty
              </h4>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Explore delicious menus and gourmet specialties around your city!
              </p>
              <button className="btn btn-primary" onClick={closeCart}>
                Browse Menus
              </button>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    boxShadow: 'var(--glass-shadow-sm)',
                  }}
                >
                  <div style={{ flex: 1, paddingRight: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        className={`diet-badge ${
                          item.menuItem.isVeg ? 'diet-veg' : 'diet-nonveg'
                        }`}
                      />
                      <span style={{ fontWeight: 700, fontSize: '14px' }}>
                        {item.menuItem.name}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: '13px',
                        color: 'var(--text-muted)',
                        marginTop: '4px',
                      }}
                    >
                      ${item.menuItem.price.toFixed(2)} × {item.quantity} ={' '}
                      <strong style={{ color: 'var(--text-main)' }}>
                        ${(item.menuItem.price * item.quantity).toFixed(2)}
                      </strong>
                    </div>
                    {item.specialNotes && (
                      <p
                        style={{
                          fontSize: '11px',
                          color: 'var(--primary-hover)',
                          fontStyle: 'italic',
                          marginTop: '2px',
                        }}
                      >
                        Note: {item.specialNotes}
                      </p>
                    )}
                  </div>

                  {/* Glass Quantity Stepper */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid rgba(249, 115, 22, 0.3)',
                      borderRadius: 'var(--radius-full)',
                      padding: '2px 4px',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                    }}
                  >
                    <button
                      onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                      style={{
                        border: 'none',
                        background: 'none',
                        padding: '4px 6px',
                        cursor: 'pointer',
                        color: 'var(--text-main)',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Minus size={13} />
                    </button>
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 800,
                        padding: '0 6px',
                        minWidth: '22px',
                        textAlign: 'center',
                      }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                      style={{
                        border: 'none',
                        background: 'none',
                        padding: '4px 6px',
                        cursor: 'pointer',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button
                  onClick={clearCart}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--danger)',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Trash2 size={12} /> Clear cart
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer with Glass Subtotal & Checkout */}
        {items.length > 0 && (
          <div
            style={{
              padding: '20px 24px',
              borderTop: '1px solid rgba(255, 255, 255, 0.6)',
              backgroundColor: 'rgba(255, 255, 255, 0.65)',
              backdropFilter: 'blur(16px)',
            }}
          >
            {!minOrderMet && (
              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: 'var(--warning-light)',
                  color: '#92400e',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '12px',
                  marginBottom: '14px',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                }}
              >
                Add <strong>${remainingForMin.toFixed(2)}</strong> more to reach the restaurant minimum order of ${restaurant.minOrder.toFixed(2)}.
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <span style={{ color: 'var(--text-muted)', fontSize: '15px', fontWeight: 600 }}>
                Item Subtotal
              </span>
              <span style={{ fontWeight: 800, fontSize: '20px' }}>
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <button
              className="btn btn-primary btn-lg w-full"
              disabled={!minOrderMet}
              onClick={handleCheckout}
              style={{
                opacity: minOrderMet ? 1 : 0.6,
                cursor: minOrderMet ? 'pointer' : 'not-allowed',
              }}
            >
              Checkout ({itemCount} {itemCount === 1 ? 'item' : 'items'}) <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
