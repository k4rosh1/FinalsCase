import React, { createContext, useState, useEffect } from 'react';
import { cartAPI } from '../services/api';
import { calculateSellingPrice } from '../utils/PricingUtils';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is logged in
  const isLoggedIn = () => {
    return !!localStorage.getItem('authToken');
  };

  // Load cart from backend when component mounts or user logs in
  const loadCart = async () => {
    if (!isLoggedIn()) {
      setCartItems([]);
      setSelectedItems([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await cartAPI.get();
      
      // Transform backend cart data to match frontend structure
      const transformedItems = (data.cart_items || []).map(item => ({
        id: item.product.id,
        name: item.product.product_name,
        price: parseFloat(item.product.price),
        discount: parseInt(item.product.discount) || 0,
        imageUrl: item.product.image_url,
        stock: parseInt(item.product.stock),
        quantity: parseInt(item.quantity),
        cartItemId: item.id, // Backend cart_item ID for updates/deletes
      }));

      setCartItems(transformedItems);
    } catch (err) {
      console.error('Failed to load cart:', err);
      setError(err.message);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Load cart on mount and when auth changes
  useEffect(() => {
    loadCart();
  }, []);

  // Calculate selected subtotal
  const selectedSubtotal = cartItems
    .filter(item => selectedItems.includes(item.id))
    .reduce((total, item) => {
      const validQuantity = parseInt(item.quantity) || 0;
      const sellingPrice = calculateSellingPrice(item.price, item.discount);
      return total + (validQuantity * sellingPrice);
    }, 0);

  // Toggle item selection
  const toggleSelectItem = (itemId) => {
    setSelectedItems(prevSelected =>
      prevSelected.includes(itemId)
        ? prevSelected.filter(id => id !== itemId)
        : [...prevSelected, itemId]
    );
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => item.id));
    }
  };

  // Add to cart
  const addToCart = async (product, quantity = 1) => {
    if (!isLoggedIn()) {
      throw new Error('Please login to add items to cart');
    }

    if (!product || quantity < 1) {
      throw new Error('Invalid product or quantity');
    }

    setLoading(true);
    setError(null);

    try {
      await cartAPI.addItem(product.id, quantity);
      await loadCart(); // Reload cart to get updated data
      return true;
    } catch (err) {
      console.error('Failed to add to cart:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Remove from cart
  const removeFromCart = async (productId) => {
    if (!isLoggedIn()) return;

    const item = cartItems.find(i => i.id === productId);
    if (!item) return;

    setLoading(true);
    setError(null);

    try {
      await cartAPI.removeItem(item.cartItemId);
      await loadCart();
      
      // Remove from selected items
      setSelectedItems(prev => prev.filter(id => id !== productId));
    } catch (err) {
      console.error('Failed to remove from cart:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Increase quantity
  const increaseQuantity = async (productId) => {
    if (!isLoggedIn()) return;

    const item = cartItems.find(i => i.id === productId);
    if (!item) return;

    const newQuantity = item.quantity + 1;

    // Check stock
    if (newQuantity > item.stock) {
      throw new Error(`Cannot add more than ${item.stock} units of ${item.name}`);
    }

    setLoading(true);
    setError(null);

    try {
      await cartAPI.updateItem(item.cartItemId, newQuantity);
      await loadCart();
    } catch (err) {
      console.error('Failed to increase quantity:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Decrease quantity
  const decreaseQuantity = async (productId) => {
    if (!isLoggedIn()) return;

    const item = cartItems.find(i => i.id === productId);
    if (!item) return;

    if (item.quantity <= 1) {
      // Remove item if quantity would go to 0
      await removeFromCart(productId);
      return;
    }

    const newQuantity = item.quantity - 1;

    setLoading(true);
    setError(null);

    try {
      await cartAPI.updateItem(item.cartItemId, newQuantity);
      await loadCart();
    } catch (err) {
      console.error('Failed to decrease quantity:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!isLoggedIn()) {
      setCartItems([]);
      setSelectedItems([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await cartAPI.clear();
      setCartItems([]);
      setSelectedItems([]);
    } catch (err) {
      console.error('Failed to clear cart:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Remove selected items
  const removeSelectedItems = async () => {
    if (!isLoggedIn() || selectedItems.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      // Remove each selected item
      const itemsToRemove = cartItems.filter(item => selectedItems.includes(item.id));
      
      for (const item of itemsToRemove) {
        await cartAPI.removeItem(item.cartItemId);
      }

      await loadCart();
      setSelectedItems([]);
    } catch (err) {
      console.error('Failed to remove selected items:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Refresh cart (for external use)
  const refreshCart = loadCart;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        selectedItems,
        selectedSubtotal,
        loading,
        error,
        toggleSelectItem,
        toggleSelectAll,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        removeSelectedItems,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};