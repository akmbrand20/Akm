const mongoose = require("mongoose");

const productImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    publicId: {
      type: String,
      default: "",
      trim: true,
    },
    alt: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const productSizeSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      required: true,
      trim: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { _id: false }
);

const productColorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: [productImageSchema],
      default: [],
    },
    sizes: {
      type: [productSizeSchema],
      default: [],
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    oldPrice: {
      type: Number,
      default: null,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    fabric: {
      type: String,
      default:
        "Premium everyday fabric designed for comfort, structure, and clean movement.",
      trim: true,
    },

    fit: {
      type: String,
      default: "Relaxed everyday fit",
      trim: true,
    },

    careInstructions: {
      type: String,
      default: "Wash with similar colors. Do not bleach.",
      trim: true,
    },

    colors: {
      type: [productColorSchema],
      default: [],
    },

    featured: {
      type: Boolean,
      default: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    shopTheLook: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

productSchema.virtual("totalStock").get(function () {
  return this.colors.reduce((total, color) => {
    const colorStock = color.sizes.reduce((sum, sizeItem) => {
      return sum + Number(sizeItem.stock || 0);
    }, 0);

    return total + colorStock;
  }, 0);
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Product", productSchema);