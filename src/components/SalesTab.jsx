import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Receipt, ShoppingBag, MapPin, Check, Plus, Snowflake, Gift, Pencil } from 'lucide-react';
import { formatCurrency } from '../utils';

export default function SalesTab({
  products,
  promos,
  clients,
  onRegisterSale,
  notify
}) {
  const [saleCart, setSaleCart] = useState([]);
  const [selectedClient, setSelectedClient] = useState('Cliente Casual');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [address, setAddress] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');

  // ESTADO PARA EL PRECIO PERSONALIZADO DEL HIELO EN EL COMBO
  const [iceCustomPrice, setIceCustomPrice] = useState(0); // Por defecto $0 (Regalo)
  const [isIcePriceCustomized, setIsIcePriceCustomized] = useState(true);

  const cartEndRef = useRef(null);

  useEffect(() => {
    if (saleCart.length > 0) {
      cartEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [saleCart]);

  // DETECTAR SI HAY AL MENOS UNA PROMO/COMBO EN EL CARRITO
  const hasPromoInCart = useMemo(() => {
    return saleCart.some((i) => i.type === 'promo');
  }, [saleCart]);

  // CALCULAR PRECIO EFECTIVO DE CADA ÍTEM
  const getItemEffectivePrice = (item) => {
    const isIce = item.name.toLowerCase().includes('hielo');
    if (hasPromoInCart && item.type === 'product' && isIce && isIcePriceCustomized) {
      return Math.max(0, parseFloat(iceCustomPrice) || 0);
    }
    return item.price;
  };

  const categories = useMemo(() => {
    const prodCats = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);
    return ['Todas', 'Promociones', ...prodCats];
  }, [products]);

  const availableItems = useMemo(() => {
    let items = [];

    if (categoryFilter === 'Todas' || categoryFilter === 'Promociones') {
      promos.filter(p => p.active).forEach(p => {
        items.push({
          id: p.id,
          name: p.name,
          type: 'promo',
          price: p.price,
          description: p.description,
          raw: p
        });
      });
    }

    if (categoryFilter !== 'Promociones') {
      products.forEach(p => {
        if (categoryFilter === 'Todas' || p.category === categoryFilter) {
          items.push({
            id: p.id,
            name: p.name,
            type: 'product',
            price: p.sellPrice,
            costPrice: p.costPrice,
            stock: p.stock,
            brand: p.brand,
            category: p.category,
            raw: p
          });
        }
      });
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(term));
    }

    return items;
  }, [products, promos, categoryFilter, searchTerm]);

  const addToSaleCart = (item) => {
    if (item.type === 'product' && item.stock <= 0) {
      notify('⚠️ Producto sin stock disponible');
      return;
    }

    if (item.type === 'promo') {
      const hasNoStock = item.raw.items?.some((comp) => {
        const p = products.find((prod) => prod.id === comp.productId);
        return !p || p.stock < comp.quantity;
      });
      if (hasNoStock) {
        notify('⚠️ Promoción sin stock disponible');
        return;
      }
    }

    setSaleCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      
      if (item.type === 'product') {
        const currentQtyInCart = existing ? existing.qty : 0;
        if (currentQtyInCart + 1 > item.stock) {
          notify(`⚠️ Alcanzaste el límite de stock de ${item.name}`);
          return prev;
        }
      }

      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateCartQty = (id, delta) => {
    setSaleCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;

            if (delta > 0 && item.type === 'product') {
              const prod = products.find((p) => p.id === item.id);
              if (prod && newQty > prod.stock) {
                notify(`⚠️ No hay suficiente stock para agregar más ${item.name}`);
                return item;
              }
            }

            return newQty <= 0 ? null : { ...item, qty: newQty };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const cartTotal = useMemo(() => {
    return saleCart.reduce((acc, i) => acc + getItemEffectivePrice(i) * i.qty, 0);
  }, [saleCart, hasPromoInCart, iceCustomPrice, isIcePriceCustomized]);

  const cartCostTotal = useMemo(() => {
    return saleCart.reduce((acc, item) => {
      if (item.type === 'product') {
        return acc + item.costPrice * item.qty;
      } else if (item.type === 'promo') {
        const promoCost = item.raw.items.reduce((pAcc, comp) => {
          const prod = products.find((p) => p.id === comp.productId);
          return pAcc + (prod ? prod.costPrice * comp.quantity : 0);
        }, 0);
        return acc + promoCost * item.qty;
      }
      return acc;
    }, 0);
  }, [saleCart, products]);

  const handleConfirmSale = () => {
    const updatedCartForSale = saleCart.map((i) => ({
      ...i,
      price: getItemEffectivePrice(i)
    }));

    onRegisterSale({
      saleCart: updatedCartForSale,
      selectedClient,
      paymentMethod,
      address,
      cartTotal,
      cartCostTotal,
      clearCart: () => {
        setSaleCart([]);
        setAddress('');
      }
    });
  };

  const hasIceInCart = saleCart.some((i) => i.type === 'product' && i.name.toLowerCase().includes('hielo'));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-7 space-y-5">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar producto por nombre o promo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-fuchsia-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                categoryFilter === cat
                  ? 'bg-fuchsia-500 text-slate-950 border-fuchsia-500 font-bold shadow-md shadow-fuchsia-500/20'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {availableItems.map((item) => {
            const isOutOfStock =
              item.type === 'product'
                ? item.stock <= 0
                : item.raw.items?.some((comp) => {
                    const p = products.find((prod) => prod.id === comp.productId);
                    return !p || p.stock < comp.quantity;
                  });

            return (
              <div
                key={item.id}
                onClick={() => !isOutOfStock && addToSaleCart(item)}
                className={`p-4 rounded-2xl transition-all flex flex-col justify-between space-y-3 group ${
                  isOutOfStock
                    ? 'bg-red-950/30 border border-red-500/60 opacity-80 cursor-not-allowed'
                    : 'bg-slate-900/80 border border-slate-800 hover:border-fuchsia-500/50 cursor-pointer hover:scale-[1.02]'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start gap-1">
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${isOutOfStock ? 'text-red-400' : 'text-slate-500'}`}>
                      {item.type === 'promo' ? 'PROMO' : item.brand}
                    </span>
                    {item.type === 'product' && (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        item.stock <= 0
                          ? 'bg-red-500 text-slate-950 border border-red-400 font-extrabold'
                          : item.stock <= item.raw.minStock
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {item.stock <= 0 ? 'Sin Stock' : `Stock: ${item.stock}`}
                      </span>
                    )}
                    {item.type === 'promo' && isOutOfStock && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-red-500 text-slate-950 border border-red-400 font-extrabold">
                        Sin Stock
                      </span>
                    )}
                  </div>
                  <h3 className={`font-semibold text-xs mt-1 line-clamp-2 transition ${isOutOfStock ? 'text-red-300 font-bold' : 'text-slate-100 group-hover:text-fuchsia-400'}`}>
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className={`text-[10px] line-clamp-2 mt-1 ${isOutOfStock ? 'text-red-400/80' : 'text-slate-400'}`}>
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
                  <span className={`font-mono font-bold text-sm ${isOutOfStock ? 'text-red-400' : 'text-fuchsia-400'}`}>
                    {formatCurrency(item.price)}
                  </span>
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition shadow ${
                    isOutOfStock
                      ? 'bg-red-900/50 text-red-400 cursor-not-allowed'
                      : 'bg-slate-800 group-hover:bg-fuchsia-500 group-hover:text-slate-950 text-slate-300'
                  }`}>
                    <Plus className="w-4 h-4 stroke-[3]" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between space-y-5 shadow-xl">
        <div>
          <div className="flex justify-between items-center pb-4 border-b border-slate-800">
            <div>
              <h2 className="font-bold text-base text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-fuchsia-400" /> Ticket de Venta
              </h2>
              <p className="text-[11px] text-slate-400">Todos los productos cargados se registrarán en esta sola venta</p>
            </div>
            {saleCart.length > 0 && (
              <button onClick={() => setSaleCart([])} className="text-xs text-red-400 hover:underline font-medium">
                Vaciar
              </button>
            )}
          </div>

          <div className="space-y-2 mt-4 max-h-[280px] overflow-y-auto pr-1 transition-all">
            {saleCart.length === 0 ? (
              <div className="text-center text-slate-500 py-12 space-y-2">
                <ShoppingBag className="w-10 h-10 mx-auto opacity-30 text-slate-400" />
                <p className="text-xs">El carrito está vacío.<br />Selecciona los productos para agrupar en esta venta.</p>
              </div>
            ) : (
              saleCart.map((item) => {
                const effectivePrice = getItemEffectivePrice(item);
                const hasDiscount = effectivePrice < item.price;

                return (
                  <div key={item.id} className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-2xl flex items-center justify-between text-xs">
                    <div className="flex-1 pr-2">
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium text-slate-200 line-clamp-1">{item.name}</p>
                        {hasDiscount && (
                          <span className="bg-cyan-500/20 text-cyan-300 text-[9px] px-1.5 py-0.5 rounded-md border border-cyan-500/30 font-bold flex items-center gap-0.5">
                            {effectivePrice === 0 ? <Gift className="w-2.5 h-2.5 text-emerald-400" /> : <Snowflake className="w-2.5 h-2.5 text-cyan-400" />}
                            {effectivePrice === 0 ? 'REGALO ($0)' : 'PRECIO ESPECIAL'}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono mt-0.5">
                        {hasDiscount ? (
                          <>
                            <span className="line-through text-slate-500 mr-1.5">{formatCurrency(item.price)}</span>
                            <span className="text-cyan-400 font-bold">{formatCurrency(effectivePrice)} c/u</span>
                          </>
                        ) : (
                          <span className="text-fuchsia-400">{formatCurrency(item.price)} c/u</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800">
                      <button onClick={() => updateCartQty(item.id, -1)} className="text-slate-400 hover:text-white px-1 font-bold text-sm">-</button>
                      <span className="font-mono font-bold text-white px-1">{item.qty}</span>
                      <button onClick={() => updateCartQty(item.id, 1)} className="text-slate-400 hover:text-white px-1 font-bold text-sm">+</button>
                    </div>
                    <span className="font-mono font-bold text-white ml-3 w-20 text-right">
                      {formatCurrency(effectivePrice * item.qty)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* PANEL INTERACTIVO DE CONFIGURACIÓN DE PRECIO DE HIELO EN EL TICKET */}
        {hasPromoInCart && hasIceInCart && (
          <div className="bg-cyan-950/40 border border-cyan-500/40 p-3 rounded-2xl text-xs space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5 text-[11px]">
                <Snowflake className="w-4 h-4 text-cyan-400" /> Hielo con Combo (Precio Especial):
              </span>
              <button
                onClick={() => setIsIcePriceCustomized(!isIcePriceCustomized)}
                className="text-[10px] text-slate-400 hover:text-cyan-300 underline font-medium"
              >
                {isIcePriceCustomized ? 'Usar Precio Normal' : 'Activar Precio Combo'}
              </button>
            </div>

            {isIcePriceCustomized && (
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setIceCustomPrice(0)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition flex items-center gap-1 ${
                    parseFloat(iceCustomPrice) === 0
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <Gift className="w-3.5 h-3.5" /> 🎁 Regalo ($0)
                </button>

                <div className="flex-1 relative">
                  <span className="absolute left-2.5 top-1.5 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    step="any"
                    placeholder="Precio especial..."
                    value={iceCustomPrice}
                    onChange={(e) => setIceCustomPrice(e.target.value)}
                    className="w-full bg-slate-900 border border-cyan-500/50 rounded-xl pl-6 pr-2 py-1.5 text-xs text-cyan-300 font-mono font-bold focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div>
            <label className="text-xs text-slate-400 block mb-1.5 font-medium">Cliente:</label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-fuchsia-500"
            >
              <option value="Cliente Casual">Cliente Casual / Ocasional</option>
              {clients.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
            {paymentMethod === 'Fiado' && selectedClient === 'Cliente Casual' && (
              <p className="text-[11px] text-amber-400 font-medium mt-1 flex items-center gap-1">
                ⚠️ Para fiar debés seleccionar un cliente registrado.
              </p>
            )}
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1.5 font-medium">Medio de Pago:</label>
            <div className="grid grid-cols-3 gap-2">
              {['Efectivo', 'Transferencia', 'Fiado'].map((m) => (
                <button
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border transition ${
                    paymentMethod === m
                      ? m === 'Fiado'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-bold'
                        : 'bg-fuchsia-500/10 border-fuchsia-500 text-fuchsia-400 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1.5 font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-fuchsia-400" /> Dirección de Entrega (Opcional):
            </label>
            <input
              type="text"
              placeholder="Ej: Av. San Martín 1234, CABA"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-fuchsia-500"
            />
          </div>

          <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
            <span className="text-xs text-slate-400 font-semibold uppercase">Total a Cobrar:</span>
            <span className="font-mono font-bold text-2xl text-fuchsia-400">
              {formatCurrency(cartTotal)}
            </span>
          </div>

          <button
            disabled={saleCart.length === 0}
            onClick={handleConfirmSale}
            className={`w-full font-bold py-3.5 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 ${
              paymentMethod === 'Fiado'
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-950 shadow-fuchsia-500/20'
            } disabled:bg-slate-800 disabled:text-slate-600`}
          >
            <Check className="w-5 h-5 stroke-[3]" /> Registrar Venta ({saleCart.length} ítems)
          </button>

          <div ref={cartEndRef} />
        </div>
      </div>
    </div>
  );
}