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
      const totalWeight = weightFactor * qty;

      totalComboCost += totalWeight;

      itemsDetail.push({
        name: prod.name,
        qty,
        totalWeight
      });
    } else if (item.name) {
      // Resguardo si la promo guarda directo el nombre del producto
      itemsDetail.push({
        name: item.name,
        qty,
        totalWeight: 0
      });
    }
  });

  if (itemsDetail.length === 0) return '';

  const numericPromoPrice = parseFloat(promoPrice) || 0;

  // 2. Si hay precio de promo cargado y los costos base suman más de 0
  if (numericPromoPrice > 0 && totalComboCost > 0) {
    let allocatedTotalSum = 0;

    // Calculamos y redondeamos el total de cada producto a múltiplos de $10
    const itemsAllocated = itemsDetail.map((item) => {
      if (item.totalWeight <= 0) return { ...item, allocatedTotal: 0 };

      const exactProportion = numericPromoPrice * (item.totalWeight / totalComboCost);
      const roundedTotal = Math.round(exactProportion / 10) * 10;
      allocatedTotalSum += roundedTotal;

      return {
        ...item,
        allocatedTotal: roundedTotal
      };
    });

    // Ajustamos cualquier diferencia de $10 en el producto de mayor valor para que sume exacto
    const diff = numericPromoPrice - allocatedTotalSum;
    if (diff !== 0 && itemsAllocated.length > 0) {
      let maxIdx = 0;
      let maxVal = -1;
      itemsAllocated.forEach((item, idx) => {
        if (item.totalWeight > maxVal) {
          maxVal = item.totalWeight;
          maxIdx = idx;
        }
      });
      itemsAllocated[maxIdx].allocatedTotal += diff;
    }

    // 3. Generamos las etiquetas de texto con precios terminados en 0
    const formattedItems = itemsAllocated.map((item) => {
      if (item.totalWeight <= 0) return `${item.qty}x ${item.name}`;

      const unitPrice = Math.round(item.allocatedTotal / item.qty / 10) * 10;
      const priceText = item.qty > 1 
        ? `$${unitPrice.toLocaleString('es-AR')} c/u` 
        : `$${item.allocatedTotal.toLocaleString('es-AR')}`;

      return `${item.qty}x ${item.name} (${priceText})`;
    });

    return formattedItems.join(' + ');
  }

  // Caso por defecto mientras no haya precio cargado
  return itemsDetail.map((i) => `${i.qty}x ${i.name}`).join(' + ');
};