import { createContext, useContext, useState, useEffect } from 'react';
import {
  getCart,
  addToCart as apiAddToCart,
  removeFromCart as apiRemoveFromCart,
  updateCartItem as apiUpdateCartItem,
} from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  const refreshCart = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await getCart();
      setCart(res.data);
    } catch (err) {
      console.error('Could not load cart', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) refreshCart();
    else setCart({ items: [] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const addItem = async (productId, quantity, size, color, price) => {
    if (!user) {
      toast.error('Sign in to add items to your bag');
      return false;
    }
    try {
      const res = await apiAddToCart({ productId, quantity, size, color, price });
      setCart(res.data);
      toast.success('Added to bag');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add item');
      return false;
    }
  };

  const removeItem = async (itemId) => {
    try {
      const res = await apiRemoveFromCart(itemId);
      setCart(res.data);
      toast.success('Removed from bag');
    } catch (err) {
      toast.error('Could not remove item');
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const res = await apiUpdateCartItem(itemId, quantity);
      setCart(res.data);
    } catch (err) {
      toast.error('Could not update quantity');
    }
  };

  const cartCount = cart.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
  const cartTotal = cart.items?.reduce((sum, i) => sum + i.price * i.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{ cart, loading, addItem, removeItem, updateQuantity, refreshCart, cartCount, cartTotal }}
    >
      {children}
    </CartContext.Provider>
  );
};
