import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { calculateCartTotals } from "../lib/cartCalculations";
import { useSettings } from "./SettingsContext";
import { getProducts } from "../services/productService";
import { usePublicOffers } from "../hooks/usePublicOffers";
import {
  getCartVariantQuantity,
  getMissingBundleSlots,
  getProductVariantImage,
  getVariantStock as getProductVariantStock,
  hasBundleProductData,
  normalizeProductId,
} from "../lib/bundleCompletion";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "akm_cart";
const COUPON_STORAGE_KEY = "akm_coupon";
const ACTIVE_BUNDLE_STORAGE_KEY = "akm_active_bundle_offer";

const getStoredCart = () => {
  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    return storedCart ? JSON.parse(storedCart) : [];
  } catch {
    return [];
  }
};

const getStoredCoupon = () => {
  try {
    const storedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);
    return storedCoupon ? JSON.parse(storedCoupon) : null;
  } catch {
    return null;
  }
};

const getStoredActiveBundleOfferId = () => {
  try {
    return localStorage.getItem(ACTIVE_BUNDLE_STORAGE_KEY) || "";
  } catch {
    return "";
  }
};

const normalizeOfferId = (value) => {
  return normalizeProductId(value);
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

const hasUsableBundleProducts = (offer) => {
  const bundleProducts = Array.isArray(offer?.bundleProducts)
    ? offer.bundleProducts
    : [];

  return (
    bundleProducts.length >= 2 &&
    bundleProducts.every((product) => hasBundleProductData(product))
  );
};

const hydrateBundleOffers = (offers = [], products = []) => {
  return offers.map((offer) => {
    if (offer.type !== "bundle") return offer;

    const bundleProducts = Array.isArray(offer.bundleProducts)
      ? offer.bundleProducts
          .map((product) => {
            if (hasBundleProductData(product)) {
              return product;
            }

            return products.find(
              (candidate) =>
                normalizeProductId(candidate) === normalizeProductId(product)
            );
          })
          .filter(Boolean)
      : [];

    return {
      ...offer,
      bundleProducts,
    };
  });
};

const getProductCartPrice = (product) => {
  if (
    product?.activeOffer &&
    Number(product.salePrice) < Number(product.price)
  ) {
    return Number(product.salePrice || 0);
  }

  return Number(product?.price || 0);
};

const buildProductCartItem = ({ product, color, size, quantity }) => {
  const productId = normalizeProductId(product);
  const maxStock = getProductVariantStock(product, color, size);

  return {
    cartItemId: `${productId}-${color}-${size}`,
    productId,
    slug: product.slug,
    name: product.name,
    category: product.category,
    color,
    size,
    quantity,
    price: getProductCartPrice(product),
    originalPrice: product.price,
    offerBadge: product.activeOffer?.badge || "",
    offerTitle: product.activeOffer?.title || "",
    image: getProductVariantImage(product, color) || "/images/akm-logo.webp",
    maxStock,
  };
};

const mergeCartItems = (currentItems = [], itemsToAdd = []) => {
  return itemsToAdd.reduce((nextItems, item) => {
    if (!item?.productId || !item?.color || !item?.size) return nextItems;

    const cartItemId = buildCartItemId(item);
    const quantityToAdd = getSafeQuantity(item.quantity);
    const maxStock = getSafeMaxStock(item);

    if (maxStock <= 0) return nextItems;

    const existingItem = nextItems.find(
      (cartItem) =>
        normalizeProductId(cartItem.productId) ===
          normalizeProductId(item.productId) &&
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

      return nextItems.map((cartItem) =>
        cartItem.cartItemId === existingItem.cartItemId
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
    if (safeQuantity <= 0) return nextItems;

    return [
      ...nextItems,
      {
        ...item,
        cartItemId,
        quantity: safeQuantity,
        maxStock: maxStock === Infinity ? item.maxStock : maxStock,
      },
    ];
  }, currentItems);
};

export function CartProvider({ children }) {
  const { deliveryFee, freeShippingThreshold } = useSettings();
  const { data: publicOffers = [] } = usePublicOffers();
  const needsBundleProducts = publicOffers.some(
    (offer) => offer.type === "bundle" && !hasUsableBundleProducts(offer)
  );
  const {
    data: fallbackProducts,
    isError: fallbackProductsError,
    isSuccess: fallbackProductsLoaded,
  } = useQuery({
    queryKey: ["products", {}],
    queryFn: () => getProducts(),
    enabled: needsBundleProducts,
  });
  const offers = useMemo(() => {
    if (!needsBundleProducts) return publicOffers;
    if (fallbackProductsLoaded) {
      return hydrateBundleOffers(publicOffers, fallbackProducts || []);
    }
    if (fallbackProductsError) return publicOffers;
    return [];
  }, [
    fallbackProducts,
    fallbackProductsError,
    fallbackProductsLoaded,
    needsBundleProducts,
    publicOffers,
  ]);

  const [cartItems, setCartItems] = useState(getStoredCart);
  const [coupon, setCoupon] = useState(getStoredCoupon);
  const [activeBundleOfferId, setActiveBundleOfferId] = useState(
    getStoredActiveBundleOfferId
  );

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (coupon) {
      localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupon));
    } else {
      localStorage.removeItem(COUPON_STORAGE_KEY);
    }
  }, [coupon]);

  useEffect(() => {
    if (activeBundleOfferId) {
      localStorage.setItem(ACTIVE_BUNDLE_STORAGE_KEY, activeBundleOfferId);
    } else {
      localStorage.removeItem(ACTIVE_BUNDLE_STORAGE_KEY);
    }
  }, [activeBundleOfferId]);

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
    setActiveBundleOfferId("");
  };

  const applyCoupon = (couponData) => {
    setCoupon(couponData);
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  const completeBundleOffer = ({ offer, selectedItems = [] }) => {
    if (!offer || !Array.isArray(selectedItems)) {
      return { success: false, reason: "invalid" };
    }

    const offerId = normalizeOfferId(offer);
    const selectedItemsBySlotId = new Map(
      selectedItems.map((item) => [item.slotId, item])
    );
    let result = { success: false, reason: "invalid" };

    setCartItems((currentItems) => {
      const missingSlots = getMissingBundleSlots(offer, currentItems);

      if (missingSlots.length === 0) {
        result = { success: false, reason: "complete" };
        return currentItems;
      }

      const plannedVariantCounts = new Map();
      const itemsToAdd = [];

      for (const slot of missingSlots) {
        const selectedItem = selectedItemsBySlotId.get(slot.slotId);
        const color = selectedItem?.color || "";
        const size = selectedItem?.size || "";

        if (!color || !size || !hasBundleProductData(slot.product)) {
          result = { success: false, reason: "missing_variant" };
          return currentItems;
        }

        const maxStock = getProductVariantStock(slot.product, color, size);

        if (maxStock <= 0) {
          result = { success: false, reason: "stock" };
          return currentItems;
        }

        const variantKey = `${slot.productId}-${color}-${size}`;
        const nextPlannedQuantity =
          Number(plannedVariantCounts.get(variantKey) || 0) + 1;
        const currentVariantQuantity = getCartVariantQuantity({
          cartItems: currentItems,
          productId: slot.productId,
          color,
          size,
        });

        if (currentVariantQuantity + nextPlannedQuantity > maxStock) {
          result = { success: false, reason: "stock" };
          return currentItems;
        }

        plannedVariantCounts.set(variantKey, nextPlannedQuantity);
        itemsToAdd.push(
          buildProductCartItem({
            product: slot.product,
            color,
            size,
            quantity: 1,
          })
        );
      }

      result = {
        success: true,
        addedCount: itemsToAdd.length,
      };

      return mergeCartItems(currentItems, itemsToAdd);
    });

    if (result.success && offerId) {
      setActiveBundleOfferId(offerId);
    }

    return result;
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

  const bundleOffers = useMemo(() => {
    return offers.filter(
      (offer) => offer.type === "bundle" && offer.showOnCart !== false
    );
  }, [offers]);

  const totals = useMemo(() => {
  return calculateCartTotals(
    cartItems,
    deliveryFee,
    freeShippingThreshold,
    coupon?.discount || 0,
    coupon?.code || "",
    offers,
    activeBundleOfferId
  );
}, [
  cartItems,
  deliveryFee,
  freeShippingThreshold,
  coupon,
  offers,
  activeBundleOfferId,
]);

  useEffect(() => {
    if (!activeBundleOfferId) return;

    if (cartItems.length === 0) {
      setActiveBundleOfferId("");
      return;
    }

    if (offers.length === 0) return;

    const activeOfferExists = offers.some(
      (offer) => normalizeOfferId(offer) === activeBundleOfferId
    );

    if (!activeOfferExists || totals.appliedOfferId !== activeBundleOfferId) {
      setActiveBundleOfferId("");
    }
  }, [activeBundleOfferId, cartItems.length, offers, totals.appliedOfferId]);

  const value = {
    cartItems,
    cartCount,
    totals,
    coupon,
    activeBundleOfferId,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    getCartItemQuantity,
    bundleOffers,
    completeBundleOffer,
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
