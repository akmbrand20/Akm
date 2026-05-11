export const calculateTotalStock = (product) => {
  if (!product?.colors) return 0;

  return product.colors.reduce((total, color) => {
    const colorStock = color.sizes.reduce((sum, sizeItem) => {
      return sum + Number(sizeItem.stock || 0);
    }, 0);

    return total + colorStock;
  }, 0);
};

export const getLowStockCount = (product) => {
  if (!product?.colors) return 0;

  let count = 0;

  product.colors.forEach((color) => {
    color.sizes.forEach((sizeItem) => {
      if (Number(sizeItem.stock || 0) > 0 && Number(sizeItem.stock || 0) <= 3) {
        count += 1;
      }
    });
  });

  return count;
};