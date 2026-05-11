export const getVariantStock = (product, selectedColor, selectedSize) => {
  const colorData = product?.colors?.find((color) => color.name === selectedColor);

  if (!colorData) return 0;

  const sizeData = colorData.sizes?.find((item) => item.size === selectedSize);

  return Number(sizeData?.stock || 0);
};

export const getColorImages = (product, selectedColor) => {
  const colorData = product?.colors?.find((color) => color.name === selectedColor);

  return colorData?.images || [];
};

export const getAvailableSizesForColor = (product, selectedColor) => {
  const colorData = product?.colors?.find((color) => color.name === selectedColor);

  return colorData?.sizes || [];
};