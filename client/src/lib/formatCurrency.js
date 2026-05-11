export const formatCurrency = (amount) => {
  return `${Number(amount || 0).toLocaleString()} EGP`;
};