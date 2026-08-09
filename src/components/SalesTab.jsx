import React, { useState, useMemo, useRef } from 'react';
import { toPng } from 'html-to-image';
import {
  Search,
  Plus,
  Trash2,
  Download,
  Share2,
  X,
  Sparkles,
  ShoppingBag,
  MapPin,
  UserCheck,
  DollarSign,
  Receipt
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

  // ESTADOS Y REFERENCIAS PARA EL TICKET VISUAL EN FOTO
  const [ticketModalData, setTicketModalData] = useState(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const ticketRef = useRef(null);

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

  // CÁLCULOS
  const shippingFee = parseFloat(shippingFeeInput) || 0;
  const driverExtra = parseFloat(driverExtraInput) || 0;
  const itemsTotal = cart.reduce((acc, i) => acc + i.price * i.qty, 0);
  const cartCostTotal = cart.reduce((acc, i) => acc + i.cost * i.qty, 0);
  const cartTotal = itemsTotal + shippingFee;

  // REGISTRAR LA VENTA
  const handleSubmitSale = () => {
    if (cart.length === 0) return;

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

    onRegisterSale(salePayload);

    // DATOS PARA GENERAR LA FOTO DEL TICKET
    setTicketModalData({
      ticketId: `V-${Date.now().toString().slice(-4)}`,
      date: new Date().toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      client: selectedClient,
      paymentMethod,
      address,
      items: [...cart],
      shippingFee,
      total: cartTotal
    });
  };

  // DESCARGAR TICKET COMO FOTO PNG
  const handleDownloadImage = async () => {
    if (!ticketRef.current) return;
    setIsGeneratingImage(true);

    try {
      const dataUrl = await toPng(ticketRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `Ticket-BengaDrinks-${ticketModalData.ticketId}.png`;
      link.href = dataUrl;
      link.click();
      notify('📸 Imagen del ticket descargada');
    } catch (err) {
      notify('⚠️ No se pudo generar la imagen');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // COMPARTIR FOTO DIRECTA (EN CELULARES / TABLETS)
  const handleShareImage = async () => {
    if (!ticketRef.current) return;
    setIsGeneratingImage(true);

    try {
      const dataUrl = await toPng(ticketRef.current, { cacheBust: true, pixelRatio: 2 });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `Ticket-BengaDrinks-${ticketModalData.ticketId}.png`, {
        type: 'image/png'
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Ticket de Compra - Benga Drinks',
          text: `¡Hola ${ticketModalData.client}! Acá tenés el comprobante de tu pedido. 🍹`
        });
      } else {
        handleDownloadImage();
      }
    } catch (err) {
      handleDownloadImage();
    } finally {
      setIsGeneratingImage(false);
    }
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

      {/* MODAL CON EL TICKET VISUAL EN FOTO */}
      {ticketModalData && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-fuchsia-400" /> Ticket Digital Generado
              </h3>
              <button onClick={() => setTicketModalData(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* VISTA PREVIA DEL TICKET (LO QUE SE TRANSFORMA EN IMAGEN) */}
            <div className="overflow-hidden rounded-2xl shadow-2xl">
              <div
                ref={ticketRef}
                className="bg-slate-950 text-slate-100 p-5 font-mono text-xs space-y-4 border border-fuchsia-500/30"
              >
                {/* ENCABEZADO TICKET */}
                <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-800">
                  <div className="font-black text-base tracking-wider text-fuchsia-400">BENGA DRINKS</div>
                  <div className="text-[10px] text-slate-400 uppercase">Venta de Bebidas</div>
                  <div className="text-[9px] text-slate-500 pt-1">Ticket #{ticketModalData.ticketId} • {ticketModalData.date}</div>
                </div>

                {/* DATOS DE LA COMPRA */}
                <div className="space-y-1 text-[11px] pb-3 border-b border-dashed border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cliente:</span>
                    <strong className="text-white">{ticketModalData.client}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pago:</span>
                    <strong className="text-emerald-400">{ticketModalData.paymentMethod}</strong>
                  </div>
                  {ticketModalData.address && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Envío a:</span>
                      <strong className="text-slate-200 truncate max-w-[150px]">{ticketModalData.address}</strong>
                    </div>
                  )}
                </div>

                {/* PRODUCTOS */}
                <div className="space-y-2 pb-3 border-b border-dashed border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Detalle:</span>
                  {ticketModalData.items.map((item, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex justify-between">
                        <span>{item.qty}x {item.name}</span>
                        <span className="font-bold">{formatCurrency(item.price * item.qty)}</span>
                      </div>
                      {item.raw?.description && (
                        <div className="text-[9px] text-fuchsia-300 pl-2">
                          + {item.raw.description}
                        </div>
                      )}
                    </div>
                  ))}

                  {ticketModalData.shippingFee > 0 && (
                    <div className="flex justify-between text-slate-400 pt-1">
                      <span>Costo de Envío</span>
                      <span>{formatCurrency(ticketModalData.shippingFee)}</span>
                    </div>
                  )}
                </div>

                {/* TOTAL */}
                <div className="pt-1 flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-300">TOTAL:</span>
                  <span className="text-fuchsia-400 text-base">{formatCurrency(ticketModalData.total)}</span>
                </div>

                <div className="text-center text-[9px] text-slate-500 pt-2 border-t border-dashed border-slate-800">
                  ¡Muchas gracias por tu preferencia! ✨
                </div>
              </div>
            </div>

            {/* BOTONES DE DESCARGA Y COMPARTIR */}
            <div className="space-y-2 pt-1">
              <button
                disabled={isGeneratingImage}
                onClick={handleShareImage}
                className="w-full bg-fuchsia-500 hover:bg-fuchsia-400 disabled:bg-slate-800 text-slate-950 font-bold py-3 rounded-2xl transition shadow-lg shadow-fuchsia-500/20 flex items-center justify-center gap-2 text-xs"
              >
                <Share2 className="w-4 h-4" /> Compartir Foto / Enviar
              </button>

              <button
                disabled={isGeneratingImage}
                onClick={handleDownloadImage}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold py-3 rounded-2xl transition flex items-center justify-center gap-2 text-xs"
              >
                <Download className="w-4 h-4" /> Descargar Imagen PNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}