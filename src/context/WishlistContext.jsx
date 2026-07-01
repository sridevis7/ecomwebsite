import { createContext, useContext, useState, useEffect } from 'react';
import { getWishlist, addToWishlist, removeFromWishlist } from '../services/extraApi';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  const refreshWishlist = async () => {
    if (!user) return;
    try {
      const res = await getWishlist();
      setWishlist(res.data);
    } catch (err) {
      console.error('Could not load wishlist', err);
    }
  };

  useEffect(() => {
    if (user) refreshWishlist();
    else setWishlist([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const isWishlisted = (productId) => wishlist.some((p) => p._id === productId);

  const toggleWishlist = async (productId) => {
    if (!user) {
      toast.error('Sign in to save items you love');
      return;
    }
    try {
      if (isWishlisted(productId)) {
        await removeFromWishlist(productId);
        setWishlist((w) => w.filter((p) => p._id !== productId));
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist(productId);
        toast.success('Saved to wishlist');
        refreshWishlist();
      }
    } catch (err) {
      toast.error('Could not update wishlist');
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, isWishlisted, toggleWishlist, refreshWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
