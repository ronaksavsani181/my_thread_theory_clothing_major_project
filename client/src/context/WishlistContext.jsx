import { createContext, useEffect, useState } from "react";

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {

  const [wishlistItems, setWishlistItems] = useState(
    JSON.parse(localStorage.getItem("wishlistItems")) || []
  );

  useEffect(() => {
    localStorage.setItem("wishlistItems", JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  // ADD
  const addToWishlist = (product) => {

    const exists = wishlistItems.find(
      (item) => item._id === product._id
    );

    if (exists) return;

    setWishlistItems((prev) => [...prev, product]);
  };

  // REMOVE
  const removeFromWishlist = (id) => {

    setWishlistItems((prev) =>
      prev.filter((item) => item._id !== id)
    );

  };

  // CHECK
  const isInWishlist = (id) => {
    return wishlistItems.some((item) => item._id === id);
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    localStorage.removeItem("wishlistItems");
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};