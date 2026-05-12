const products = [
  {
    name: "AKM T-Shirt",
    slug: "akm-t-shirt",
    category: "tshirt",
    price: 600,
    oldPrice: null,
    description:
      "A clean everyday T-shirt designed for comfort, easy styling, and a refined casual look.",
    fabric:
      "Premium everyday fabric designed for comfort, structure, and clean movement.",
    fit: "Relaxed everyday fit",
    careInstructions: "Wash with similar colors. Do not bleach.",
    featured: true,
    isActive: true,
    colors: [
      {
        name: "Black",
        hex: "#111111",
        images: [
          {
            url: "/images/black-shirt-front.webp",
            publicId: "",
            alt: "AKM black t-shirt front",
          },
          {
            url: "/images/black-shirt-back.webp",
            publicId: "",
            alt: "AKM black t-shirt back",
          },
          {
            url: "/images/black-shirt-front-2.webp",
            publicId: "",
            alt: "AKM black t-shirt styled front",
          },
          {
            url: "/images/black-shirt-back-2.webp",
            publicId: "",
            alt: "AKM black t-shirt styled back",
          },
          {
            url: "/images/black-shirt-arm.webp",
            publicId: "",
            alt: "AKM black t-shirt arm detail",
          },
          {
            url: "/images/black-shirt-arm-2.webp",
            publicId: "",
            alt: "AKM black t-shirt sleeve detail",
          },
        ],
        sizes: [
          { size: "M", stock: 10 },
          { size: "L", stock: 10 },
          { size: "XL", stock: 10 },
        ],
      },
      {
        name: "Brown",
        hex: "#4a3428",
        images: [
          {
            url: "/images/brown-shirt-front.webp",
            publicId: "",
            alt: "AKM brown t-shirt front",
          },
          {
            url: "/images/brown-shirt-back.webp",
            publicId: "",
            alt: "AKM brown t-shirt back",
          },
          {
            url: "/images/brown-shirt-front-2.webp",
            publicId: "",
            alt: "AKM brown t-shirt styled front",
          },
          {
            url: "/images/brown-shirt-back-2.webp",
            publicId: "",
            alt: "AKM brown t-shirt styled back",
          },
          {
            url: "/images/brown-shirt-side.webp",
            publicId: "",
            alt: "AKM brown t-shirt side detail",
          },
        ],
        sizes: [
          { size: "M", stock: 10 },
          { size: "L", stock: 10 },
          { size: "XL", stock: 10 },
        ],
      },
      {
        name: "Off White",
        hex: "#f1eee7",
        images: [
          {
            url: "/images/off-white-shirt-front.webp",
            publicId: "",
            alt: "AKM off white t-shirt front",
          },
          {
            url: "/images/off-white-shirt-side.webp",
            publicId: "",
            alt: "AKM off white t-shirt side",
          },
          {
            url: "/images/off-white-shirt-arm.webp",
            publicId: "",
            alt: "AKM off white t-shirt arm detail",
          },
        ],
        sizes: [
          { size: "M", stock: 10 },
          { size: "L", stock: 10 },
          { size: "XL", stock: 10 },
        ],
      },
    ],
  },
  {
    name: "AKM Pants",
    slug: "akm-pants",
    category: "pants",
    price: 650,
    oldPrice: null,
    description:
      "Everyday pants with a clean fit, built for comfort and versatile styling.",
    fabric:
      "Premium everyday fabric designed for comfort, structure, and clean movement.",
    fit: "Relaxed everyday fit",
    careInstructions: "Wash with similar colors. Do not bleach.",
    featured: true,
    isActive: true,
    colors: [
      {
        name: "Black",
        hex: "#111111",
        images: [
          {
            url: "/images/black-pants-front.webp",
            publicId: "",
            alt: "AKM black pants front",
          },
          {
            url: "/images/black-pants-side.webp",
            publicId: "",
            alt: "AKM black pants side",
          },
        ],
        sizes: [
          { size: "M", stock: 10 },
          { size: "L", stock: 10 },
          { size: "XL", stock: 10 },
        ],
      },
      {
        name: "Brown",
        hex: "#4a3428",
        images: [
          {
            url: "/images/brown-pants-front.webp",
            publicId: "",
            alt: "AKM brown pants front",
          },
          {
            url: "/images/brown-pants-side.webp",
            publicId: "",
            alt: "AKM brown pants side",
          },
          {
            url: "/images/brown-pants-back.webp",
            publicId: "",
            alt: "AKM brown pants back",
          },
        ],
        sizes: [
          { size: "M", stock: 10 },
          { size: "L", stock: 10 },
          { size: "XL", stock: 10 },
        ],
      },
      {
        name: "Off White",
        hex: "#f1eee7",
        images: [
          {
            url: "/images/off-white-pants-front.webp",
            publicId: "",
            alt: "AKM off white pants front",
          },
          {
            url: "/images/off-white-pants-front-2.webp",
            publicId: "",
            alt: "AKM off white pants styled front",
          },
          {
            url: "/images/off-white-pants-side.webp",
            publicId: "",
            alt: "AKM off white pants side",
          },
          {
            url: "/images/off-white-pants-side-2.webp",
            publicId: "",
            alt: "AKM off white pants styled side",
          },
        ],
        sizes: [
          { size: "M", stock: 10 },
          { size: "L", stock: 10 },
          { size: "XL", stock: 10 },
        ],
      },
    ],
  },
];

const offers = [
  {
    title: "Duo Bundle",
    slug: "duo-bundle",
    type: "bundle",
    description: "Two complete sets designed for effortless everyday styling.",
    sets: 2,
    regularPrice: 2500,
    offerPrice: 2000,
    savings: 500,
    badge: "Save 500 EGP",
    isActive: true,
    sortOrder: 1,
  },
  {
    title: "Signature Bundle",
    slug: "signature-bundle",
    type: "bundle",
    description: "Three complete sets for a stronger wardrobe upgrade.",
    sets: 3,
    regularPrice: 3750,
    offerPrice: 2800,
    savings: 950,
    badge: "Best Value",
    isActive: true,
    sortOrder: 2,
  },
];

const settings = {
  brandName: "AKM",
  tagline: "Comfort you can feel",
  deliveryFee: 80,
  freeShippingThreshold: null,
  whatsappNumber: "+201014318607",
  phone: "+201014318607",
  instagramUrl: "https://www.instagram.com/akmbrand74",
  tiktokUrl: "https://www.tiktok.com/@akmbrand74",
  facebookUrl: "https://www.facebook.com/share/1JXQWC1Kw9/?mibextid=wwXIfr",
  instapayQr: {
    url: "",
    publicId: "",
  },
  tracking: {
    metaPixelId: "",
    ga4MeasurementId: "",
    gtmId: "",
    tiktokPixelId: "",
    snapPixelId: "",
  },
  policies: {
    shippingPolicy: "",
    returnPolicy: "",
    privacyPolicy: "",
    terms: "",
  },
};

const admin = {
  fullName: "AKM Admin",
  email: "admin@akm.com",
  phone: "+20 10 16028980",
  password: "123456",
};

module.exports = {
  products,
  offers,
  settings,
  admin,
};