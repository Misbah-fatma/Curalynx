import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

const sameCartItem = (a, b) =>
  a._id === b._id && (a.packSize || null) === (b.packSize || null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    const addQty = Math.max(1, Number(product.qty) || 1);

    setCart((prev) => {
      const exists = prev.find((item) => sameCartItem(item, product));

      if (exists) {
        return prev.map((item) =>
          sameCartItem(item, product)
            ? { ...item, qty: item.qty + addQty }
            : item
        );
      }

      const { qty: _ignored, ...rest } = product;
      return [...prev, { ...rest, qty: addQty }];
    });
  };

  return (
    <CartContext.Provider value={{ cart, setCart, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
