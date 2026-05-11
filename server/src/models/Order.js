const mongoose = require("mongoose");
const {
  ORDER_STATUSES,
  PAYMENT_METHODS,
  INSTAPAY_TIMINGS,
  PAYMENT_STATUSES,
  DELIVERY_FEE,
} = require("../utils/constants");

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    slug: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      required: true,
    },

    color: {
      type: String,
      required: true,
    },

    size: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      index: true,
    },
    
    customerId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Customer",
  default: null,
},

    customer: {
      fullName: {
        type: String,
        required: true,
        trim: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      secondPhone: {
        type: String,
        default: "",
        trim: true,
      },
      email: {
        type: String,
        default: "",
        trim: true,
        lowercase: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      address: {
        type: String,
        required: true,
        trim: true,
      },
      notes: {
        type: String,
        default: "",
        trim: true,
      },
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "Order must have at least one item.",
      },
    },

    subtotal: {
      type: Number,
      required: true,
    },

    shippingFee: {
      type: Number,
      default: DELIVERY_FEE,
    },

    discount: {
      type: Number,
      default: 0,
    },

    bundleDiscount: {
  type: Number,
  default: 0,
},

couponDiscount: {
  type: Number,
  default: 0,
},

    total: {
      type: Number,
      required: true,
    },

    appliedOffer: {
      type: String,
      default: null,
    },

    coupon: {
  code: {
    type: String,
    default: "",
  },
  discount: {
    type: Number,
    default: 0,
  },
},

    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
      required: true,
    },

    instapayTiming: {
      type: String,
      enum: INSTAPAY_TIMINGS,
      default: "",
    },

    transactionReference: {
      type: String,
      default: "",
      trim: true,
    },

    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "Unpaid",
    },

    orderStatus: {
      type: String,
      enum: ORDER_STATUSES,
      default: "Pending",
    },

    notifications: {
  ownerEmailSent: {
    type: Boolean,
    default: false,
  },
  ownerEmailSentAt: {
    type: Date,
    default: null,
  },
  ownerEmailError: {
    type: String,
    default: "",
  },

  customerEmailSent: {
    type: Boolean,
    default: false,
  },
  customerEmailSentAt: {
    type: Date,
    default: null,
  },
  customerEmailError: {
    type: String,
    default: "",
  },
},

    tracking: {
  eventId: {
    type: String,
    default: "",
  },
  metaCapiSent: {
    type: Boolean,
    default: false,
  },
  metaCapiSentAt: {
    type: Date,
    default: null,
  },
  metaCapiError: {
    type: String,
    default: "",
  },
},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);