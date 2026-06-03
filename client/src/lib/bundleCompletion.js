export const normalizeProductId = (value) => {
  if (!value) return "";
  return String(value._id || value.id || value);
};

export const hasBundleProductData = (product) => {
  return (
    product &&
    typeof product === "object" &&
    normalizeProductId(product) &&
    Array.isArray(product.colors)
  );
};

export const getBundleRequiredItems = (bundle) => {
  const requiredQuantity = Number(bundle?.sets || 0);
  const bundleProducts = Array.isArray(bundle?.bundleProducts)
    ? bundle.bundleProducts
    : [];

  if (requiredQuantity <= 0 || bundleProducts.length === 0) return [];

  const requiredItemsByProductId = new Map();

  bundleProducts.forEach((product) => {
    const productId = normalizeProductId(product);
    if (!productId) return;

    const existingItem = requiredItemsByProductId.get(productId);

    requiredItemsByProductId.set(productId, {
      productId,
      product: hasBundleProductData(product)
        ? product
        : existingItem?.product || product,
      quantity: Number(existingItem?.quantity || 0) + requiredQuantity,
    });
  });

  return Array.from(requiredItemsByProductId.values());
};

export const getCurrentCartQuantityForBundleProduct = (
  cartItems = [],
  productId
) => {
  const targetProductId = normalizeProductId(productId);

  return cartItems
    .filter((item) => normalizeProductId(item.productId) === targetProductId)
    .reduce((total, item) => total + Number(item.quantity || 0), 0);
};

export const getMissingBundleSlots = (bundle, cartItems = []) => {
  const bundleKey =
    bundle?._id || bundle?.id || bundle?.slug || bundle?.title || "bundle";

  return getBundleRequiredItems(bundle).flatMap((requiredItem) => {
    const currentQuantity = getCurrentCartQuantityForBundleProduct(
      cartItems,
      requiredItem.productId
    );
    const missingQuantity = Math.max(
      0,
      Number(requiredItem.quantity || 0) - currentQuantity
    );

    return Array.from({ length: missingQuantity }, (_, index) => ({
      slotId: `${bundleKey}-${requiredItem.productId}-${index + 1}`,
      productId: requiredItem.productId,
      product: requiredItem.product,
      color: "",
      size: "",
    }));
  });
};

export const getAvailableColors = (product) => {
  return Array.isArray(product?.colors)
    ? product.colors.filter((color) => color?.name)
    : [];
};

export const getAvailableSizesForColor = (product, color) => {
  const colorData = getAvailableColors(product).find(
    (productColor) => productColor.name === color
  );

  return Array.isArray(colorData?.sizes)
    ? colorData.sizes.filter((sizeItem) => sizeItem?.size)
    : [];
};

export const getVariantStock = (product, color, size) => {
  const sizeData = getAvailableSizesForColor(product, color).find(
    (sizeItem) => sizeItem.size === size
  );

  return Number(sizeData?.stock || 0);
};

export const getProductVariantImage = (product, color) => {
  const colors = getAvailableColors(product);
  const colorData =
    colors.find((productColor) => productColor.name === color) || colors[0];

  return colorData?.images?.[0]?.url || "";
};

export const getCartVariantQuantity = ({
  cartItems = [],
  productId,
  color,
  size,
}) => {
  const targetProductId = normalizeProductId(productId);

  return cartItems
    .filter(
      (item) =>
        normalizeProductId(item.productId) === targetProductId &&
        item.color === color &&
        item.size === size
    )
    .reduce((total, item) => total + Number(item.quantity || 0), 0);
};
