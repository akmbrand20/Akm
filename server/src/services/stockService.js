const Product = require("../models/Product");
const {
  getBestActiveOfferForProduct,
  calculateOfferPrice,
} = require("./offerPricingService");

const findVariant = (product, colorName, sizeName) => {
  const color = product.colors.find(
    (item) => item.name.toLowerCase() === String(colorName).toLowerCase()
  );

  if (!color) {
    return {
      color: null,
      size: null,
    };
  }

  const size = color.sizes.find(
    (item) => item.size.toLowerCase() === String(sizeName).toLowerCase()
  );

  return {
    color,
    size,
  };
};

const validateAndBuildOrderItems = async (cartItems = []) => {
  const orderItems = [];

  for (const cartItem of cartItems) {
    const product = await Product.findById(cartItem.productId);

    if (!product || !product.isActive) {
      throw new Error(`Product is no longer available.`);
    }

    const { color, size } = findVariant(product, cartItem.color, cartItem.size);

    if (!color || !size) {
      throw new Error(`${product.name} variant is not available.`);
    }

    if (Number(size.stock) < Number(cartItem.quantity)) {
      throw new Error(
        `Only ${size.stock} left for ${product.name} - ${cartItem.color} / ${cartItem.size}.`
      );
    }

    const activeOffer = await getBestActiveOfferForProduct(
      product._id,
      product.price
    );

    const offerPricing = calculateOfferPrice(product.price, activeOffer);

    const image = color.images?.[0]?.url || "";

    orderItems.push({
      productId: product._id,
      name: product.name,
      slug: product.slug,
      category: product.category,
      color: color.name,
      size: size.size,
      quantity: Number(cartItem.quantity),
      price: Number(offerPricing.finalPrice),
      image,
    });
  }

  return orderItems;
};

const decreaseStockAfterOrder = async (items = []) => {
  for (const item of items) {
    const product = await Product.findById(item.productId);

    if (!product) continue;

    const { size } = findVariant(product, item.color, item.size);

    if (!size) continue;

    size.stock = Math.max(0, Number(size.stock) - Number(item.quantity));

    await product.save();
  }
};

module.exports = {
  validateAndBuildOrderItems,
  decreaseStockAfterOrder,
};