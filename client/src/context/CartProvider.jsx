import { useState, useEffect } from "react";
import { CartContext } from "./CartContext";

export const CartProvider = ({ children }) => {

  const [cartItems, setCartItems] = useState(() => {
    const stored = localStorage.getItem("cartItems");
    return stored ? JSON.parse(stored) : [];
  });

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // Add to cart
  const addToCart = (product, size) => {

    const existing = cartItems.find(
      (item) => item._id === product._id && item.size === size
    );

    if (existing) {
      setCartItems((prev) =>
        prev.map((item) =>
          item._id === product._id && item.size === size
            ? { ...item, qty: item.qty + 1 }
            : item
        )
      );
    } else {
      setCartItems((prev) => [
        ...prev,
        { ...product, size, qty: 1 }
      ]);
    }
  };

  // Remove item
  const removeFromCart = (id, size) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => !(item._id === id && item.size === size)
      )
    );
  };

  // Update quantity
  const updateQty = (id, size, qty) => {

    if (qty < 1) return;

    setCartItems((prev) =>
      prev.map((item) =>
        item._id === id && item.size === size
          ? { ...item, qty }
          : item
      )
    );
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cartItems");
  };

  // Total amount
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        totalAmount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};