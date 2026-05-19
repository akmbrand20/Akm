import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { calculateCartTotals } from "../lib/cartCalculations";
import { useSettings } from "./SettingsContext";
import { getOffers } from "../services/offerService";
import { getProducts } from "../services/productService";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "akm_cart";
const COUPON_STORAGE_KEY = "akm_coupon";

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

const normalizeProductId = (value) => {
  if (!value) return "";
  return String(value._id || value.id || value);
};

const hasUsableBundleProducts = (offer) => {
  return (
    Array.isArray(offer?.bundleProducts) &&
    offer.bundleProducts.filter(
      (product) => product && typeof product === "object" && product.colors
    ).length >= 2
  );
};

const getDefaultBundleProducts = (products = []) => {
  const activeProducts = products.filter((product) => product?.isActive !== false);
  const tshirt = activeProducts.find((product) =>
    String(product.category || "").includes("tshirt")
  );
  const pants = activeProducts.find((product) =>
    String(product.category || "").includes("pants")
  );

  if (tshirt && pants && normalizeProductId(tshirt) !== normalizeProductId(pants)) {
    return [tshirt, pants];
  }

  return activeProducts.slice(0, 2);
};

const hydrateBundleOffers = (offers = [], products = []) => {
  const defaultBundleProducts = getDefaultBundleProducts(products);

  return offers.map((offer) => {
    const bundleProducts = Array.isArray(offer.bundleProducts)
      ? offer.bundleProducts
          .map((product) => {
            if (product && typeof product === "object" && product.colors) {
              return product;
            }

            return products.find(
              (candidate) =>
                normalizeProductId(candidate) === normalizeProductId(product)
            );
          })
          .filter(Boolean)
      : [];

    if (bundleProducts.length >= 2) {
      return {
        ...offer,
        bundleProducts,
      };
    }

    if (defaultBundleProducts.length >= 2) {
      return {
        ...offer,
        bundleProducts: defaultBundleProducts,
      };
    }

    return offer;
  });
};

const getProductVariantStock = (product, color, size) => {
  const colorData = product?.colors?.find(
    (productColor) => productColor.name === color
  );
  const sizeData = colorData?.sizes?.find((sizeItem) => sizeItem.size === size);

  return Number(sizeData?.stock || 0);
};

const getProductVariantImage = (product, color) => {
  const colorData = product?.colors?.find(
    (productColor) => productColor.name === color
  );

  return colorData?.images?.[0]?.url || "/images/akm-logo.webp";
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
    image: getProductVariantImage(product, color),
    maxStock,
  };
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
      const nextBundleOffers = offers.filter((offer) => offer.type === "bundle");
      const needsProducts = nextBundleOffers.some(
        (offer) => !hasUsableBundleProducts(offer)
      );

      if (needsProducts) {
        try {
          const products = await getProducts();
          setBundleOffers(hydrateBundleOffers(nextBundleOffers, products));
          return;
        } catch {
          setBundleOffers(nextBundleOffers);
          return;
        }
      }

      setBundleOffers(nextBundleOffers);
    } catch {
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

  const completeBundleOffer = ({ offer, baseCartItemId }) => {
    if (!offer || !baseCartItemId) return;

    const targetQuantity = Number(offer.sets || 0);
    const bundleProducts = Array.isArray(offer.bundleProducts)
      ? offer.bundleProducts
      : [];

    if (targetQuantity <= 0 || bundleProducts.length < 2) return;

    setCartItems((currentItems) => {
      const baseItem = currentItems.find(
        (item) => item.cartItemId === baseCartItemId
      );

      if (!baseItem) return currentItems;

      const baseProductId = normalizeProductId(baseItem.productId);
      const baseIsInBundle = bundleProducts.some(
        (product) => normalizeProductId(product) === baseProductId
      );

      if (!baseIsInBundle) return currentItems;

      const partnerProduct = bundleProducts.find(
        (product) => normalizeProductId(product) !== baseProductId
      );

      if (!partnerProduct) return currentItems;

      const partnerProductId = normalizeProductId(partnerProduct);
      const partnerMaxStock = getProductVariantStock(
        partnerProduct,
        baseItem.color,
        baseItem.size
      );

      if (partnerMaxStock <= 0) return currentItems;

      let partnerExists = false;

      const updatedItems = currentItems.map((item) => {
        if (item.cartItemId === baseItem.cartItemId) {
          const maxStock = getSafeMaxStock(item);

          return {
            ...item,
            quantity: Math.min(
              Math.max(Number(item.quantity || 1), targetQuantity),
              maxStock
            ),
          };
        }

        const isPartnerVariant =
          normalizeProductId(item.productId) === partnerProductId &&
          item.color === baseItem.color &&
          item.size === baseItem.size;

        if (!isPartnerVariant) return item;

        partnerExists = true;

        return {
          ...item,
          ...buildProductCartItem({
            product: partnerProduct,
            color: baseItem.color,
            size: baseItem.size,
            quantity: Math.min(
              Math.max(Number(item.quantity || 1), targetQuantity),
              partnerMaxStock
            ),
          }),
          quantity: Math.min(
            Math.max(Number(item.quantity || 1), targetQuantity),
            partnerMaxStock
          ),
        };
      });

      if (partnerExists) return updatedItems;

      return [
        ...updatedItems,
        buildProductCartItem({
          product: partnerProduct,
          color: baseItem.color,
          size: baseItem.size,
          quantity: Math.min(targetQuantity, partnerMaxStock),
        }),
      ];
    });
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
