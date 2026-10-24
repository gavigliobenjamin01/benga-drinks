import React from 'react';
import { X, Image as ImageIcon, Plus, Trash2, TrendingUp, Pencil } from 'lucide-react';
import { formatCurrency, formatPromoDescription } from '../../utils';

export default function PromoModal({
  isOpen,
  editingPromo,
  onClose,
  onSubmit,
  products,
  promoItems,
  promoPriceInput,
  setPromoPriceInput,
  promoDescription,
  setPromoDescription,
  selectedProdForPromo,
  setSelectedProdForPromo,
  onAddProductToPromo,
  onUpdatePromoItemQty,
  onRemoveProductFromPromo
}) {
  if (!isOpen) return null;
  const isEditing = Boolean(editingPromo);

  const currentPromoCost = promoItems.reduce((acc, item) => {
    const p = products.find((prod) => prod.id === item.productId);
    const cost = p ? (p.costPrice ?? p.cost ?? 0) : 0;
    return acc + cost * item.quantity;
  }, 0);

  const currentPromoPrice = parseFloat(promoPriceInput) || 0;
  const currentPromoProfit = currentPromoPrice - currentPromoCost;
  const currentPromoMarginPct = currentPromoCost > 0 ? Math.round((currentPromoProfit / currentPromoCost) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            {isEditing ? <><Pencil className="w-4 h-4 text-fuchsia-400" /> Modificar Promoción</> : 'Nueva Promoción'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Nombre de Promo:</label>
            <input required name="name" defaultValue={editingPromo?.name || ''} placeholder="Ej: Combo Fernet + Coca" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Tipo de Promo:</label>
            <select name="type" defaultValue={editingPromo?.type || 'pack'} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white">
              <option value="pack">Pack / Combo de varios productos</option>
              <option value="discount">Descuento especial (%)</option>
              <option value="custom">2x1 / Regalo / Especial</option>
            </select>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-2xl border border-fuchsia-500/30 space-y-1">
            <label className="text-fuchsia-400 font-bold block mb-1 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4" /> Link de Imagen / Foto (URL Opcional):
            </label>
            <input
              name="imageUrl"
              defaultValue={editingPromo?.imageUrl || ''}
              placeholder="https://ejemplo.com/foto-promo.jpg"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-fuchsia-500"
            />
          </div>

          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 space-y-2">
            <label className="text-fuchsia-400 font-bold block">Agregar productos del Inventario:</label>
            <div className="flex gap-2">
              <select
                value={selectedProdForPromo}
                onChange={(e) => setSelectedProdForPromo(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2 text-white text-xs"
              >
                <option value="">Seleccionar producto...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.brand})</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  onAddProductToPromo(selectedProdForPromo);
                  setSelectedProdForPromo('');
                }}
                className="bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1"
              >
                <Plus className="w-4 h-4 stroke-[3]" /> Agregar
              </button>
            </div>

            {promoItems.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Productos incluidos:</span>
                {promoItems.map((item) => {
                  const prod = products.find((p) => p.id === item.productId);
                  return (
                    <div key={item.productId} className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-xl text-slate-200">
                      <span className="font-medium truncate pr-2">{prod ? prod.name : 'Producto'}</span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                          <button type="button" onClick={() => onUpdatePromoItemQty(item.productId, -1)} className="text-slate-400 hover:text-white font-bold">-</button>
                          <span className="font-mono text-white px-1">{item.quantity}</span>
                          <button type="button" onClick={() => onUpdatePromoItemQty(item.productId, 1)} className="text-slate-400 hover:text-white font-bold">+</button>
                        </div>
                        <button type="button" onClick={() => onRemoveProductFromPromo(item.productId)} className="text-red-400 hover:text-red-300">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-medium">Precio Final de Venta ($):</label>
            <input
              required
              type="number"
              step="any"
              placeholder="Ej: 5000"
              value={promoPriceInput}
              onChange={(e) => {
                const newPrice = e.target.value;
                setPromoPriceInput(newPrice);
                setPromoDescription(formatPromoDescription(promoItems, products, newPrice));
              }}
              className="w-full bg-slate-950 border border-fuchsia-500/50 rounded-xl p-2.5 text-white font-mono text-sm focus:outline-none focus:border-fuchsia-400"
            />
          </div>

          {promoItems.length > 0 && (
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-emerald-500/40 space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Costo total productos del combo:</span>
                <span className="font-mono text-white font-bold">{formatCurrency(currentPromoCost)}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800">
                <span className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" /> Ganancia Limpia:
                </span>
                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-400 text-base block">
                    {formatCurrency(currentPromoProfit)}
                  </span>
                  {currentPromoCost > 0 && currentPromoPrice > 0 && (
                    <span className="text-[10px] text-emerald-300/80 font-mono">
                      ({currentPromoMarginPct}% de margen)
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="text-slate-400 block mb-1">Descripción:</label>
            <input
              required
              name="description"
              value={promoDescription}
              onChange={(e) => setPromoDescription(e.target.value)}
              placeholder="Ej: Fernet, Coca, Hielo"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
            />
          </div>

          <div className="flex gap-2 pt-2">
            {isEditing && (
              <button type="button" onClick={onClose} className="flex-1 bg-slate-800 text-slate-300 font-bold py-3 rounded-xl">
                Cancelar
              </button>
            )}
            <button type="submit" className="flex-1 bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-950 font-bold py-3 rounded-xl transition shadow-lg shadow-fuchsia-500/20">
              {isEditing ? 'Guardar Cambios' : 'Guardar Promoción'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}