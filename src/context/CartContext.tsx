'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

export interface CartItemType {
  id: string;
  userId: string;
  menuItemId: string;
  quantity: number;
  specialNotes?: string | null;
  menuItem: {
    id: string;
    name: string;
    price: number;
    category: string;
    imageUrl: string;
    isVeg: boolean;
    restaurantId: string;
    restaurant: {
      id: string;
      name: string;
      deliveryFee: number;
      minOrder: number;
      image: string;
    };
  };
}

interface CartContextType {
  items: CartItemType[];
  subtotal: number;
  itemCount: number;
  restaurant: any;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (menuItem: any, quantity?: number, notes?: string, forceReplace?: boolean) => Promise<boolean>;
  updateQuantity: (menuItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  pendingConflictItem: any | null;
  resolveConflict: (replace: boolean) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItemType[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [pendingConflictItem, setPendingConflictItem] = useState<any | null>(null);

  const refreshCart = async () => {
    if (!user) {
      setItems([]);
      setSubtotal(0);
      setItemCount(0);
      setRestaurant(null);
      return;
    }

    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        setSubtotal(data.subtotal || 0);
        setItemCount(data.count || 0);
        setRestaurant(data.restaurant || null);
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  const addToCart = async (menuItem: any, quantity = 1, notes = '', forceReplace = false): Promise<boolean> => {
    if (!user) {
      alert('Please sign in or select a demo account to add items to your cart.');
      return false;
    }

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menuItemId: menuItem.id,
          quantity,
          specialNotes: notes,
          forceReplace,
        }),
      });

      const data = await res.json();

      if (res.status === 409 && data.error === 'DIFFERENT_RESTAURANT') {
        setPendingConflictItem({ menuItem, quantity, notes });
        return false;
      }

      if (res.ok) {
        await refreshCart();
        setIsCartOpen(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Add to cart error:', err);
      return false;
    }
  };

  const resolveConflict = async (replace: boolean) => {
    if (replace && pendingConflictItem) {
      await addToCart(
        pendingConflictItem.menuItem,
        pendingConflictItem.quantity,
        pendingConflictItem.notes,
        true
      );
    }
    setPendingConflictItem(null);
  };

  const updateQuantity = async (menuItemId: string, quantity: number) => {
    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menuItemId,
          quantity,
        }),
      });
      await refreshCart();
    } catch (err) {
      console.error('Update quantity error:', err);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      await fetch(`/api/cart?itemId=${cartItemId}`, { method: 'DELETE' });
      await refreshCart();
    } catch (err) {
      console.error('Remove item error:', err);
    }
  };

  const clearCart = async () => {
    try {
      await fetch('/api/cart?clear=true', { method: 'DELETE' });
      await refreshCart();
    } catch (err) {
      console.error('Clear cart error:', err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        subtotal,
        itemCount,
        restaurant,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        toggleCart: () => setIsCartOpen((prev) => !prev),
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
        pendingConflictItem,
        resolveConflict,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
