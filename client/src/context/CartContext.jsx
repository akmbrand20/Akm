import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { calculateCartTotals } from "../lib/cartCalculations";
import { useSettings } from "./SettingsContext";
import { getOffers } from "../services/offerService";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "akm_cart";
const COUPON_STORAGE_KEY = "akm_coupon";

const getStoredCart = () => {
  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    return storedCart ? JSON.parse(storedCart) : [];
  } catch (error) {
    return [];
  }
};

const getStoredCoupon = () => {
  try {
    const storedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);
    return storedCoupon ? JSON.parse(storedCoupon) : null;
  } catch (error) {
    return null;
  }
};

const getSafeQuantity = (quantity) => {
  const number = Number(quantity || 1);
  return Number.isFinite(number) && number > 0 ? number : 1;
};

const getSafeMaxStock = (item) => {
  const stock = Number(item?.maxStock || 0);
  return Number.isFinite(stock) && stock > 0 ? stock : Infinity;
};

const buildCartItemId = (item) => {
  return (
    item.cartItemId ||
    `${item.productId || item._id}-${item.color || ""}-${item.size || ""}`
  );
};

export function CartProvider({ children }) {
  const { deliveryFee, freeShippingThreshold } = useSettings();
  const [bundleOffers, setBundleOffers] = useState([]);

  const [cartItems, setCartItems] = useState(getStoredCart);
  const [coupon, setCoupon] = useState(getStoredCoupon);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
  const loadBundleOffers = async () => {
    try {
      const offers = await getOffers();
      setBundleOffers(offers.filter((offer) => offer.type === "bundle"));
    } catch (error) {
      setBundleOffers([]);
    }
  };

  loadBundleOffers();
}, []);

  useEffect(() => {
    if (coupon) {
      localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupon));
    } else {
      localStorage.removeItem(COUPON_STORAGE_KEY);
    }
  }, [coupon]);

  const addToCart = (item) => {
    if (!item?.productId || !item?.color || !item?.size) return false;

    const cartItemId = buildCartItemId(item);
    const quantityToAdd = getSafeQuantity(item.quantity);
    const maxStock = getSafeMaxStock(item);

    if (maxStock <= 0) return false;

    let added = false;

    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (cartItem) =>
          cartItem.productId === item.productId &&
          cartItem.color === item.color &&
          cartItem.size === item.size
      );

      if (existingItem) {
        const existingMaxStock = getSafeMaxStock(existingItem);
        const finalMaxStock = Math.min(existingMaxStock, maxStock);
        const nextQuantity = Math.min(
          Number(existingItem.quantity || 0) + quantityToAdd,
          finalMaxStock
        );

        added = nextQuantity > Number(existingItem.quantity || 0);

        return currentItems.map((cartItem) =>
          cartItem.productId === item.productId &&
          cartItem.color === item.color &&
          cartItem.size === item.size
            ? {
                ...cartItem,
                ...item,
                cartItemId,
                quantity: nextQuantity,
                maxStock:
                  finalMaxStock === Infinity
                    ? cartItem.maxStock || item.maxStock
                    : finalMaxStock,
              }
            : cartItem
        );
      }

      const safeQuantity = Math.min(quantityToAdd, maxStock);
      added = safeQuantity > 0;

      return [
        ...currentItems,
        {
          ...item,
          cartItemId,
          quantity: safeQuantity,
          maxStock: maxStock === Infinity ? item.maxStock : maxStock,
        },
      ];
    });

    return added;
  };

  const increaseQuantity = (cartItemId) => {
    setCartItems((currentItems) =>
      currentItems.map((item) => {
        if (item.cartItemId !== cartItemId) return item;

        const maxStock = getSafeMaxStock(item);
        const currentQuantity = Number(item.quantity || 1);

        return {
          ...item,
          quantity: Math.min(currentQuantity + 1, maxStock),
        };
      })
    );
  };

  const decreaseQuantity = (cartItemId) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: Math.max(1, Number(item.quantity || 1) - 1) }
          : item
      )
    );
  };

  const removeFromCart = (cartItemId) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.cartItemId !== cartItemId)
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
  };

  const applyCoupon = (couponData) => {
    setCoupon(couponData);
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  const getCartItemQuantity = ({ productId, color, size }) => {
    const item = cartItems.find(
      (cartItem) =>
        cartItem.productId === productId &&
        cartItem.color === color &&
        cartItem.size === size
    );

    return Number(item?.quantity || 0);
  };

  const cartCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + Number(item.quantity || 0), 0);
  }, [cartItems]);

  const totals = useMemo(() => {
  return calculateCartTotals(
    cartItems,
    deliveryFee,
    freeShippingThreshold,
    coupon?.discount || 0,
    coupon?.code || "",
    bundleOffers
  );
}, [cartItems, deliveryFee, freeShippingThreshold, coupon, bundleOffers]);

  const value = {
    cartItems,
    cartCount,
    totals,
    coupon,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    getCartItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}