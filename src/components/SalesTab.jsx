import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Send,
  Copy,
  Check,
  X,
  Sparkles,
  ShoppingBag,
  MapPin,
  UserCheck,
  DollarSign
} from 'lucide-react';
import { formatCurrency } from '../utils';

export default function SalesTab({
  products = [],
  promos = [],
  clients = [],
  onRegisterSale,
  notify
}) {
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedClient, setSelectedClient] = useState('Cliente Casual');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [address, setAddress] = useState('');
  const [shippingFeeInput, setShippingFeeInput] = useState('');
  const [driverExtraInput, setDriverExtraInput] = useState('');

  // ESTADO PARA MODAL DE ENVIAR TICKET LUEGO DE VENDER
  const [ticketModalData, setTicketModalData] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  // OBTENER CATEGORÍAS
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);
    return ['Todas', 'Promos', ...cats];
  }, [products]);

  // FILTRAR CATÁLOGO
  const filteredCatalog = useMemo(() => {
    const term = searchTerm.toLowerCase();

    if (selectedCategory === 'Promos') {
      return promos
        .filter((pr) => pr.active && pr.name?.toLowerCase().includes(term))
        .map((pr) => ({ ...pr, isPromo: true }));
    }

    let prods = products.filter(
      (p) =>
        p.name?.toLowerCase().includes(term) ||
        p.brand?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term)
    );

    if (selectedCategory !== 'Todas') {
      prods = prods.filter((p) => p.category === selectedCategory);
    }

    return prods.map((p) => ({ ...p, isPromo: false }));
  }, [products, promos, searchTerm, selectedCategory]);

  // AGREGAR AL CARRITO
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.isPromo === item.isPromo);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id && i.isPromo === item.isPromo ? { ...i, qty: i.qty + 1 } : i
        );
      }

      let price = item.isPromo ? item.price : item.sellPrice;
      let cost = item.isPromo
        ? (item.items || []).reduce((acc, comp) => {
            const pObj = products.find((p) => p.id === comp.productId);
            return acc + (pObj ? pObj.costPrice * comp.quantity : 0);
          }, 0)
        : item.costPrice;

      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price,
          cost,
          qty: 1,
          type: item.isPromo ? 'promo' : 'product',
          raw: item
        }
      ];
    });
  };

  const updateQty = (id, isPromo, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id && (item.type === 'promo') === isPromo) {
            const newQty = item.qty + delta;
            return newQty <= 0 ? null : { ...item, qty: newQty };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // CÁLCULOS DE CARRITO
  const shippingFee = parseFloat(shippingFeeInput) || 0;
  const driverExtra = parseFloat(driverExtraInput) || 0;
  const itemsTotal = cart.reduce((acc, i) => acc + i.price * i.qty, 0);
  const cartCostTotal = cart.reduce((acc, i) => acc + i.cost * i.qty, 0);
  const cartTotal = itemsTotal + shippingFee;

  // ARMAR EL TEXTO DETALLADO DEL TICKET
  const buildTicketText = (saleData) => {
    const clientObj = clients.find((c) => c.name === saleData.client);

    let itemsFormatted = saleData.items
      .map((i) => {
        let line = `• ${i.qty}x ${i.name}`;
        if (i.raw?.description) {
          line += `\n   └─ Incluye: ${i.raw.description}`;
        }
        line += ` ($${(i.price * i.qty).toLocaleString('es-AR')})`;
        return line;
      })
      .join('\n');

    let text = `🍹 *BENGA DRINKS - DETALLE DE COMPRA* 🍹\n`;
    text += `----------------------------------------\n`;
    text += `👤 *Cliente:* ${saleData.client}\n`;
    text += `💳 *Medio de Pago:* ${saleData.paymentMethod}\n`;
    if (saleData.address) {
      text += `📍 *Dirección de Envío:* ${saleData.address}\n`;
    }
    text += `----------------------------------------\n`;
    text += `📦 *PRODUCTOS:* \n${itemsFormatted}\n`;

    if (saleData.shippingFee > 0) {
      text += `🛵 *Envío:* $${saleData.shippingFee.toLocaleString('es-AR')}\n`;
    }

    text += `----------------------------------------\n`;
    text += `💰 *TOTAL FINAL:* $${saleData.total.toLocaleString('es-AR')}\n`;
    text += `----------------------------------------\n`;
    text += `¡Muchas gracias por tu compra! 🙌✨`;

    return { text, phone: clientObj?.phone || '' };
  };

  // REGISTRAR LA VENTA
  const handleSubmitSale = () => {
    if (cart.length === 0) return;

    // VALIDACIÓN: Si intenta fiar a Cliente Casual, frena la función y NO abre el ticket
    if (paymentMethod === 'Fiado' && selectedClient === 'Cliente Casual') {
      notify('⚠️ Para fiar, seleccioná un cliente específico de la lista');
      return;
    }

    const salePayload = {
      saleCart: cart,
      selectedClient,
      paymentMethod,
      address,
      shippingFee,
      driverExtra,
      cartTotal,
      cartCostTotal,
      clearCart: () => {
        setCart([]);
        setAddress('');
        setShippingFeeInput('');
        setDriverExtraInput('');
      }
    };

    // Ejecutamos el registro en Firebase
    onRegisterSale(salePayload);

    // Armamos los datos del ticket para abrir el modal SOLO SI PASÓ LA VALIDACIÓN
    const preparedSale = {
      client: selectedClient,
      paymentMethod,
      address,
      items: cart,
      shippingFee,
      total: cartTotal
    };

    const { text, phone } = buildTicketText(preparedSale);
    setTicketModalData({ text, phone });
  };

  const handleCopyTicket = () => {
    if (!ticketModalData) return;
    navigator.clipboard.writeText(ticketModalData.text);
    setIsCopied(true);
    notify('📋 Ticket copiado al portapapeles');
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSendWhatsApp = () => {
    if (!ticketModalData) return;
    const cleanPhone = ticketModalData.phone.replace(/[^0-9]/g, '');
    const encodedText = encodeURIComponent(ticketModalData.text);

    let url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodedText}`
      : `https://wa.me/?text=${encodedText}`;

    window.open(url, '_blank');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LADO IZQUIERDO: CATÁLOGO Y BUSCADOR */}
      <div className="lg:col-span-7 space-y-4">
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar fernet, vodka, hielo, combos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-fuchsia-500 transition"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                  selectedCategory === cat
                    ? 'bg-fuchsia-500 text-slate-950 border-fuchsia-400 shadow-md shadow-fuchsia-500/20'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {cat === 'Promos' ? '🔥 Promos & Combos' : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
          {filteredCatalog.map((item) => (
            <div
              key={item.id}
              onClick={() => addToCart(item)}
              className={`border p-3.5 rounded-2xl cursor-pointer transition flex items-center justify-between group hover:scale-[1.01] ${
                item.isPromo
                  ? 'bg-fuchsia-950/20 border-fuchsia-500/40 hover:border-fuchsia-400'
                  : 'bg-slate-900/80 border-slate-800 hover:border-fuchsia-500/50'
              }`}
            >
              <div className="space-y-1 flex-1 pr-2">
                <span className="text-[10px] uppercase font-bold text-slate-500">
                  {item.isPromo ? '🔥 Combo / Promo' : item.brand}
                </span>
                <h3 className="font-semibold text-xs text-slate-100 group-hover:text-fuchsia-400 line-clamp-1">
                  {item.name}
                </h3>
                {item.description && (
                  <p className="text-[10px] text-fuchsia-300 line-clamp-1">
                    ✨ {item.description}
                  </p>
                )}
                <div className="font-mono text-sm font-bold text-emerald-400">
                  {formatCurrency(item.isPromo ? item.price : item.sellPrice)}
                </div>
              </div>

              <div className="w-8 h-8 rounded-xl bg-slate-800 group-hover:bg-fuchsia-500 group-hover:text-slate-950 text-slate-300 flex items-center justify-center transition shadow">
                <Plus className="w-4 h-4 stroke-[3]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LADO DERECHO: TICKET Y REGISTRO DE VENTA */}
      <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <h2 className="font-bold text-base text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-fuchsia-400" /> Venta Actual
          </h2>
          {cart.length > 0 && (
            <button onClick={() => setCart([])} className="text-xs text-red-400 hover:underline">
              Vaciar
            </button>
          )}
        </div>

        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
          {cart.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">
              Seleccioná productos o combos de la izquierda para sumar a la venta.
            </p>
          ) : (
            cart.map((item) => (
              <div
                key={`${item.id}-${item.type}`}
                className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div className="truncate flex-1 pr-2">
                  <span className="font-semibold text-slate-100 block truncate">{item.name}</span>
                  <span className="font-mono text-emerald-400 text-[11px]">
                    {formatCurrency(item.price * item.qty)}
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => updateQty(item.id, item.type === 'promo', -1)}
                    className="text-slate-400 hover:text-white px-1 font-bold"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-white px-1">{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.id, item.type === 'promo', 1)}
                    className="text-slate-400 hover:text-white px-1 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-400 block mb-1 font-medium flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-fuchsia-400" /> Cliente:
              </label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-medium focus:outline-none focus:border-fuchsia-500"
              >
                <option value="Cliente Casual">Cliente Casual</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-medium flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Medio de Pago:
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-medium focus:outline-none focus:border-fuchsia-500"
              >
                <option value="Efectivo">💵 Efectivo</option>
                <option value="Transferencia">💳 Transferencia / MP</option>
                <option value="Fiado">📝 Fiado (Deuda)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-fuchsia-400" /> Dirección de Envío (Opcional):
            </label>
            <input
              type="text"
              placeholder="Ej: Calle San Martín 1234, Dpto 2B"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white focus:outline-none focus:border-fuchsia-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Costo Envío ($):</label>
              <input
                type="number"
                placeholder="0"
                value={shippingFeeInput}
                onChange={(e) => setShippingFeeInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Extra Delivery ($):</label>
              <input
                type="number"
                placeholder="0"
                value={driverExtraInput}
                onChange={(e) => setDriverExtraInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase font-bold">Total a Cobrar:</span>
            <span className="font-mono text-2xl font-bold text-fuchsia-400">
              {formatCurrency(cartTotal)}
            </span>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={handleSubmitSale}
            className="w-full bg-fuchsia-500 hover:bg-fuchsia-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold py-3.5 rounded-2xl transition shadow-lg shadow-fuchsia-500/20 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" /> Registrar y Generar Ticket
          </button>
        </div>
      </div>

      {/* MODAL POPUP PARA ENVIAR TICKET */}
      {ticketModalData && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-fuchsia-400" /> ¡Venta Registrada!
                </h3>
                <p className="text-[11px] text-slate-400">¿Querés enviar el ticket de compra al cliente?</p>
              </div>
              <button
                onClick={() => setTicketModalData(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-fuchsia-500/30 text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
              {ticketModalData.text}
            </div>

            <div className="space-y-2.5">
              <button
                onClick={handleSendWhatsApp}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-2xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-xs"
              >
                <Send className="w-4 h-4 stroke-[2.5]" /> Enviar por WhatsApp
              </button>

              <button
                onClick={handleCopyTicket}
                className="w-full bg-slate-800 hover:bg-slate-700 text-fuchsia-300 border border-fuchsia-500/30 font-bold py-3.5 rounded-2xl transition flex items-center justify-center gap-2 text-xs"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> : <Copy className="w-4 h-4" />}
                {isCopied ? '¡Ticket Copiado!' : 'Copiar Ticket (Para Instagram / Chat)'}
              </button>

              <button
                onClick={() => setTicketModalData(null)}
                className="w-full bg-transparent text-slate-500 hover:text-slate-300 font-medium py-2 text-xs transition"
              >
                Omitir y cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}