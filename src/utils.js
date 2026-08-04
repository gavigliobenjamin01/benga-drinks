export const formatCurrency = (amount) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(amount || 0);

export const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatPromoDescription = (itemsArr, productsList) => {
  if (!itemsArr || itemsArr.length === 0) return '';
  return itemsArr
    .map((item) => {
      const prod = productsList.find((p) => p.id === item.productId);
      const name = prod ? prod.name : 'Producto';
      return item.quantity > 1 ? `${item.quantity} ${name}` : name;
    })
    .join(', ');
};