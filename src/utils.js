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

export const formatPromoDescription = (promoItems = [], products = [], promoPrice = 0) => {
  if (!promoItems || !Array.isArray(promoItems) || promoItems.length === 0) return '';

  const itemsDetail = [];
  let totalComboCost = 0;

  // 1. Obtener datos y sumar el costo base total de todos los componentes
  promoItems.forEach((item) => {
    const targetId = item.productId || item.id;
    const qty = Number(item.quantity || item.qty || 1);
    
    // Búsqueda por ID o por Nombre si falla la ID
    const prod = products.find(
      (p) => p.id === targetId || (p.name && item.name && p.name.toLowerCase() === item.name.toLowerCase())
    );

    if (prod) {
      const unitCost = Number(prod.costPrice ?? prod.cost ?? 0);
      const unitSell = Number(prod.sellPrice ?? prod.price ?? 0);
      
      // Se utiliza el costo base; si no está cargado, se usa el precio de venta como alternativa
      const weightFactor = unitCost > 0 ? unitCost : unitSell;

      totalComboCost += weightFactor * qty;

      itemsDetail.push({
        name: prod.name,
        qty,
        weightFactor
      });
    } else if (item.name) {
      // Resguardo si la promo guarda directo el nombre del producto
      itemsDetail.push({
        name: item.name,
        qty,
        weightFactor: 0
      });
    }
  });

  if (itemsDetail.length === 0) return '';

  const numericPromoPrice = parseFloat(promoPrice) || 0;

  // 2. Si hay precio de promo cargado y los costos base suman más de 0
  if (numericPromoPrice > 0 && totalComboCost > 0) {
    const formattedItems = itemsDetail.map((item) => {
      if (item.weightFactor <= 0) return `${item.qty}x ${item.name}`;

      // Precio proporcional por unidad asignado según el costo base
      const unitComboPrice = Math.round(numericPromoPrice * (item.weightFactor / totalComboCost));
      const priceText = item.qty > 1 
        ? `$${unitComboPrice.toLocaleString('es-AR')} c/u` 
        : `$${unitComboPrice.toLocaleString('es-AR')}`;

      return `${item.qty}x ${item.name} (${priceText})`;
    });

    return formattedItems.join(' + ');
  }

  // Caso por defecto mientras no haya precio cargado
  return itemsDetail.map((i) => `${i.qty}x ${i.name}`).join(' + ');
};