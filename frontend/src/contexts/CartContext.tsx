import React, { createContext, useContext, useState, useEffect } from 'react';
import { Cart, CartItem } from '../types';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext'; // Import AuthContext

interface CartContextType {
  cart: Cart | null;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateCartItem: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => void;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // Get user from AuthContext

  useEffect(() => {
    fetchCart();
  }, [user]); // Refetch when user changes

  const fetchCart = async () => {
    // Only fetch cart if user is authenticated
    if (!user) {
      setCart(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const cartData = await cartService.getCart();
      setCart(cartData);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      setCart(null); // Set to null on error
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: number, quantity: number = 1) => {
    if (!user) {
      throw new Error('Please log in to add items to cart');
    }
    await cartService.addToCart(productId, quantity);
    await fetchCart();
  };

  const updateCartItem = async (productId: number, quantity: number) => {
    if (!user) {
      throw new Error('Please log in to update cart');
    }
    await cartService.updateCartItem(productId, quantity);
    await fetchCart();
  };

  const removeFromCart = async (productId: number) => {
    if (!user) {
      throw new Error('Please log in to remove items from cart');
    }
    await cartService.removeFromCart(productId);
    await fetchCart();
  };

  const clearCart = () => {
    setCart(null);
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      updateCartItem,
      removeFromCart,
      clearCart,
      loading
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};