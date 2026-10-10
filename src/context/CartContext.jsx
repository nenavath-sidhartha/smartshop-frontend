import React, { createContext, useContext, useState, useEffect } from 'react';
import cartService from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], subtotal: 0, deliveryFee: 0, total: 0, totalItemsCount: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) {
      setCart({ items: [], subtotal: 0, deliveryFee: 0, total: 0, totalItemsCount: 0 });
      return;
    }
    try {
      setLoading(true);
      const res = await cartService.getCart(user.id, user.email);
      if (res.data) {
        setCart(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      alert('Please login to add items to your shopping cart!');
      return false;
    }
    try {
      const res = await cartService.addToCart(user.id, productId, quantity);
      if (res.data) {
        setCart(res.data);
        return true;
      }
    } catch (err) {
      alert(err.message || 'Failed to add item to cart');
      return false;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const res = await cartService.updateCartItemQuantity(itemId, quantity);
      if (res.data) {
        setCart(res.data);
      }
    } catch (err) {
      alert(err.message || 'Failed to update quantity');
    }
  };

  const removeItem = async (itemId) => {
    try {
      const res = await cartService.removeCartItem(itemId);
      if (res.data) {
        setCart(res.data);
      }
    } catch (err) {
      alert(err.message || 'Failed to remove item');
    }
  };

  const clearCart = async () => {
    if (!user) return;
    try {
      const res = await cartService.clearCart(user.id);
      if (res.data) {
        setCart(res.data);
      }
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount: cart.totalItemsCount || 0,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
