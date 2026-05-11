export const BRAND = {
  name: "AKM",
  tagline: "Comfort you can feel",
  phone: "+20 10 16028980",
  whatsappNumber: "201016028980",
  instagram: "https://www.instagram.com/akmbrand74",
  tiktok: "https://www.tiktok.com/@akmbrand74",
  facebook: "",
};

export const DELIVERY_FEE = 80;

export const DEFAULT_COLOR_SUGGESTIONS = [
  "Black",
  "Brown",
  "Off White",
  "White",
  "Beige",
  "Navy",
  "Grey",
  "Olive",
];

export const DEFAULT_SIZE_SUGGESTIONS = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "One Size",
];

export const DEFAULT_CATEGORY_SUGGESTIONS = [
  "tshirt",
  "pants",
  "sweater",
  "hoodie",
  "jacket",
  "shorts",
];

export const PRODUCT_PRICES = {
  tshirt: 600,
  pants: 650,
};

export const BUNDLE_OFFERS = [
  {
    key: "duo",
    name: "Duo Bundle",
    sets: 2,
    regularPrice: 2500,
    offerPrice: 2000,
    savings: 500,
    description: "Two complete sets designed for effortless everyday styling.",
  },
  {
    key: "signature",
    name: "Signature Bundle",
    sets: 3,
    regularPrice: 3750,
    offerPrice: 2800,
    savings: 950,
    description: "Three complete sets for a stronger wardrobe upgrade.",
  },
];

export const formatProductLabel = (value = "") => {
  const cleanValue = String(value || "").trim();

  if (!cleanValue) return "Product";

  return cleanValue
    .replace(/-/g, " ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export const getCategoryLabel = formatProductLabel;