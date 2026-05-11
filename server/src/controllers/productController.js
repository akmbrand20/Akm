const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const {
  attachOfferPricingToProduct,
  attachOfferPricingToProducts,
} = require("../services/offerPricingService");

const cleanText = (value = "") => {
  return String(value).trim();
};

const createSlug = (value = "") => {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const normalizeCategory = (category = "") => {
  return createSlug(category);
};

const normalizeImages = (images = []) => {
  if (!Array.isArray(images)) return [];

  return images
    .filter((image) => image?.url)
    .map((image) => ({
      url: cleanText(image.url),
      publicId: cleanText(image.publicId || ""),
      alt: cleanText(image.alt || ""),
    }));
};

const normalizeSizes = (sizes = []) => {
  if (!Array.isArray(sizes)) return [];

  const seen = new Set();

  return sizes
    .map((sizeItem) => ({
      size: cleanText(sizeItem.size),
      stock: Math.max(0, Number(sizeItem.stock || 0)),
    }))
    .filter((sizeItem) => {
      if (!sizeItem.size) return false;

      const key = sizeItem.size.toLowerCase();

      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    });
};

const normalizeColors = (colors = []) => {
  if (!Array.isArray(colors)) return [];

  const seen = new Set();

  return colors
    .map((color) => ({
      name: cleanText(color.name),
      images: normalizeImages(color.images),
      sizes: normalizeSizes(color.sizes),
    }))
    .filter((color) => {
      if (!color.name) return false;
      if (!Array.isArray(color.sizes) || color.sizes.length === 0) return false;

      const key = color.name.toLowerCase();

      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    });
};

const collectCloudinaryPublicIds = (product) => {
  const publicIds = [];

  product.colors?.forEach((color) => {
    color.images?.forEach((image) => {
      if (image.publicId) {
        publicIds.push(image.publicId);
      }
    });
  });

  return [...new Set(publicIds)];
};

const deleteCloudinaryImages = async (publicIds = []) => {
  if (publicIds.length === 0) return;

  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    console.log("Cloudinary env vars missing. Product deleted, images not deleted.");
    return;
  }

  const results = await Promise.allSettled(
    publicIds.map((publicId) => cloudinary.uploader.destroy(publicId))
  );

  const failed = results.filter((result) => result.status === "rejected");

  if (failed.length > 0) {
    console.log(`${failed.length} Cloudinary image delete request(s) failed.`);
  }
};

const getProducts = async (req, res) => {
  const { category, color, size, search } = req.query;

  const query = {
    isActive: true,
  };

  if (category) {
    query.category = normalizeCategory(category);
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
    ];
  }

  let products = await Product.find(query).sort({ createdAt: -1 });

  if (color) {
    products = products.filter((product) =>
      product.colors.some(
        (productColor) =>
          productColor.name.toLowerCase() === String(color).toLowerCase()
      )
    );
  }

  if (size) {
    products = products.filter((product) =>
      product.colors.some((productColor) =>
        productColor.sizes.some(
          (sizeItem) =>
            sizeItem.size.toLowerCase() === String(size).toLowerCase() &&
            Number(sizeItem.stock || 0) > 0
        )
      )
    );
  }

  const productsWithPricing = await attachOfferPricingToProducts(products);

  res.json({
    success: true,
    count: productsWithPricing.length,
    products: productsWithPricing,
  });
};

const getProductFilters = async (req, res) => {
  const products = await Product.find({ isActive: true }).select(
    "category colors"
  );

  const categories = new Set();
  const colors = new Set();
  const sizes = new Set();

  products.forEach((product) => {
    if (product.category) {
      categories.add(product.category);
    }

    product.colors?.forEach((color) => {
      if (color.name) {
        colors.add(color.name);
      }

      color.sizes?.forEach((sizeItem) => {
        if (sizeItem.size && Number(sizeItem.stock || 0) > 0) {
          sizes.add(sizeItem.size);
        }
      });
    });
  });

  res.json({
    success: true,
    filters: {
      categories: Array.from(categories).sort(),
      colors: Array.from(colors).sort(),
      sizes: Array.from(sizes).sort(),
    },
  });
};

const getFeaturedProducts = async (req, res) => {
  const products = await Product.find({
    isActive: true,
    featured: true,
  }).sort({ createdAt: -1 });

  const productsWithPricing = await attachOfferPricingToProducts(products);

  res.json({
    success: true,
    count: productsWithPricing.length,
    products: productsWithPricing,
  });
};

const getProductBySlug = async (req, res) => {
  const product = await Product.findOne({
    slug: req.params.slug,
    isActive: true,
  }).populate("shopTheLook");

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  const productWithPricing = await attachOfferPricingToProduct(product);

  if (productWithPricing.shopTheLook?.length > 0) {
    productWithPricing.shopTheLook = await attachOfferPricingToProducts(
      productWithPricing.shopTheLook
    );
  }

  res.json({
    success: true,
    product: productWithPricing,
  });
};

const getAdminProducts = async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  const productsWithPricing = await attachOfferPricingToProducts(products);

  res.json({
    success: true,
    count: productsWithPricing.length,
    products: productsWithPricing,
  });
};

const getAdminProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found.",
    });
  }

  const productWithPricing = await attachOfferPricingToProduct(product);

  res.json({
    success: true,
    product: productWithPricing,
  });
};

const createAdminProduct = async (req, res) => {
  const {
    name,
    slug,
    category,
    price,
    oldPrice,
    description,
    fabric,
    fit,
    careInstructions,
    colors,
    featured,
    isActive,
  } = req.body;

  const cleanName = cleanText(name);
  const cleanCategory = normalizeCategory(category);
  const finalSlug = createSlug(slug || name);
  const finalColors = normalizeColors(colors);

  if (!cleanName || !cleanCategory || price === undefined || price === "") {
    return res.status(400).json({
      success: false,
      message: "Product name, category, and price are required.",
    });
  }

  if (!finalSlug) {
    return res.status(400).json({
      success: false,
      message: "Product slug is required.",
    });
  }

  if (finalColors.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Add at least one color and one size.",
    });
  }

  const existingProduct = await Product.findOne({ slug: finalSlug });

  if (existingProduct) {
    return res.status(400).json({
      success: false,
      message: "A product with this slug already exists.",
    });
  }

  const product = await Product.create({
    name: cleanName,
    slug: finalSlug,
    category: cleanCategory,
    price: Number(price),
    oldPrice: oldPrice === "" || oldPrice === null ? null : Number(oldPrice),
    description: cleanText(description || ""),
    fabric: cleanText(fabric || ""),
    fit: cleanText(fit || ""),
    careInstructions: cleanText(careInstructions || ""),
    colors: finalColors,
    featured: featured !== undefined ? featured : true,
    isActive: isActive !== undefined ? isActive : true,
  });

  const productWithPricing = await attachOfferPricingToProduct(product);

  res.status(201).json({
    success: true,
    message: "Product created successfully.",
    product: productWithPricing,
  });
};

const updateAdminProduct = async (req, res) => {
  const {
    name,
    slug,
    category,
    price,
    oldPrice,
    description,
    fabric,
    fit,
    careInstructions,
    colors,
    featured,
    isActive,
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found.",
    });
  }

  if (name !== undefined) {
    const cleanName = cleanText(name);

    if (!cleanName) {
      return res.status(400).json({
        success: false,
        message: "Product name cannot be empty.",
      });
    }

    product.name = cleanName;
  }

  if (slug !== undefined) {
    const finalSlug = createSlug(slug);

    if (!finalSlug) {
      return res.status(400).json({
        success: false,
        message: "Product slug cannot be empty.",
      });
    }

    const existingProduct = await Product.findOne({
      slug: finalSlug,
      _id: { $ne: product._id },
    });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "A product with this slug already exists.",
      });
    }

    product.slug = finalSlug;
  }

  if (category !== undefined) {
    const cleanCategory = normalizeCategory(category);

    if (!cleanCategory) {
      return res.status(400).json({
        success: false,
        message: "Product category cannot be empty.",
      });
    }

    product.category = cleanCategory;
  }

  if (price !== undefined) product.price = Number(price);

  if (oldPrice !== undefined) {
    product.oldPrice =
      oldPrice === "" || oldPrice === null ? null : Number(oldPrice);
  }

  if (description !== undefined) product.description = cleanText(description);
  if (fabric !== undefined) product.fabric = cleanText(fabric);
  if (fit !== undefined) product.fit = cleanText(fit);

  if (careInstructions !== undefined) {
    product.careInstructions = cleanText(careInstructions);
  }

  if (colors !== undefined) {
    const finalColors = normalizeColors(colors);

    if (finalColors.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Add at least one color and one size.",
      });
    }

    product.colors = finalColors;
  }

  if (featured !== undefined) product.featured = featured;
  if (isActive !== undefined) product.isActive = isActive;

  const updatedProduct = await product.save();
  const productWithPricing = await attachOfferPricingToProduct(updatedProduct);

  res.json({
    success: true,
    message: "Product updated successfully.",
    product: productWithPricing,
  });
};

const toggleProductStatus = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found.",
    });
  }

  product.isActive = !product.isActive;

  const updatedProduct = await product.save();
  const productWithPricing = await attachOfferPricingToProduct(updatedProduct);

  res.json({
    success: true,
    message: "Product status updated.",
    product: productWithPricing,
  });
};

const deleteAdminProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found.",
    });
  }

  const publicIds = collectCloudinaryPublicIds(product);

  await Product.updateMany(
    { shopTheLook: product._id },
    { $pull: { shopTheLook: product._id } }
  );

  await product.deleteOne();

  try {
    await deleteCloudinaryImages(publicIds);
  } catch (error) {
    console.log("Product deleted, but Cloudinary cleanup failed:", error.message);
  }

  res.json({
    success: true,
    message: "Product deleted successfully.",
  });
};

module.exports = {
  getProducts,
  getProductFilters,
  getFeaturedProducts,
  getProductBySlug,
  getAdminProducts,
  getAdminProductById,
  createAdminProduct,
  updateAdminProduct,
  toggleProductStatus,
  deleteAdminProduct,
};