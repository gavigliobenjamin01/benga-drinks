import React from 'react';
import { X, Image as ImageIcon, Calculator, Sparkles, Pencil } from 'lucide-react';
import { formatCurrency } from '../../utils';

export default function ProductModal({
  isOpen,
  editingProduct,
  onClose,
  onSubmit,
  prodCostInput,
  setProdCostInput,
  prodSellInput,
  setProdSellInput,
  prodComboInput,
  setProdComboInput,
  applySuggestedMargin
}) {
  if (!isOpen) return null;
  const isEditing = Boolean(editingProduct);

  const prodCostNum = parseFloat(prodCostInput) || 0;
  const prodSellNum = parseFloat(prodSellInput) || 0;
  const prodProfit = prodSellNum - prodCostNum;
  const prodMarginPct = prodCostNum > 0 ? Math.round((prodProfit / prodCostNum) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            {isEditing && <Pencil className="w-4 h-4 text-fuchsia-400" />}
            {isEditing ? 'Modificar Precios / Producto' : 'Nuevo Producto'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Nombre del Producto:</label>
            <input required name="name" defaultValue={editingProduct?.name || ''} placeholder="Ej: Bolsa de Hielo 4kg" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-400 block mb-1">Marca:</label>
              <input required name="brand" defaultValue={editingProduct?.brand || ''} placeholder="Ej: Rolito / Benga" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Categoría:</label>
              <input required name="category" defaultValue={editingProduct?.category || ''} placeholder="Ej: Hielo / Agregados" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-2xl border border-fuchsia-500/30 space-y-1">
            <label className="text-fuchsia-400 font-bold block mb-1 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4" /> Link de Imagen / Foto (URL Opcional):
            </label>
            <input name="imageUrl" defaultValue={editingProduct?.imageUrl || ''} placeholder="https://ejemplo.com/foto-producto.jpg" className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-fuchsia-500" />
          </div>

          <div className="space-y-2.5 bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Precio Costo ($):</label>
                <input required type="number" step="any" placeholder="1000" value={prodCostInput} onChange={(e) => setProdCostInput(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono" />
              </div>
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Precio Venta ($):</label>
                <input required type="number" step="any" placeholder="2500" value={prodSellInput} onChange={(e) => setProdSellInput(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono" />
              </div>
            </div>

            {prodCostNum > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                  <Calculator className="w-3 h-3 text-fuchsia-400" /> Precios Sugeridos por Margen:
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  <button type="button" onClick={() => applySuggestedMargin(1.3)} className="bg-slate-900 border border-slate-800 hover:border-fuchsia-500/40 text-slate-300 py-1.5 rounded-lg text-[11px] font-mono font-bold">+30%</button>
                  <button type="button" onClick={() => applySuggestedMargin(1.5)} className="bg-slate-900 border border-slate-800 hover:border-fuchsia-500/40 text-slate-300 py-1.5 rounded-lg text-[11px] font-mono font-bold">+50%</button>
                  <button type="button" onClick={() => applySuggestedMargin(1.8)} className="bg-slate-900 border border-slate-800 hover:border-fuchsia-500/40 text-slate-300 py-1.5 rounded-lg text-[11px] font-mono font-bold">+80%</button>
                  <button type="button" onClick={() => applySuggestedMargin(2.0)} className="bg-slate-900 border border-slate-800 hover:border-fuchsia-500/40 text-slate-300 py-1.5 rounded-lg text-[11px] font-mono font-bold">+100%</button>
                </div>
              </div>
            )}

            {prodCostNum > 0 && prodSellNum > 0 && (
              <div className="bg-slate-900 p-2 rounded-xl border border-emerald-500/20 flex justify-between items-center text-[11px]">
                <span className="text-emerald-400 font-bold">Ganancia por unidad:</span>
                <span className="font-mono font-bold text-emerald-400">{formatCurrency(prodProfit)} ({prodMarginPct}% margen)</span>
              </div>
            )}

            <div>
              <label className="text-amber-400 font-bold block mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Precio Combo ($ - Opcional):
              </label>
              <input type="number" step="any" placeholder="2000" value={prodComboInput} onChange={(e) => setProdComboInput(e.target.value)} className="w-full bg-slate-950 border border-amber-500/40 rounded-xl p-2.5 text-amber-400 font-mono font-bold" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {!isEditing && (
              <div>
                <label className="text-slate-400 block mb-1">Stock Inicial:</label>
                <input required type="number" name="stock" placeholder="50" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono" />
              </div>
            )}
            <div className={isEditing ? 'col-span-2' : ''}>
              <label className="text-slate-400 block mb-1">Stock Mínimo Alerta:</label>
              <input required type="number" name="minStock" defaultValue={editingProduct?.minStock ?? 5} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono" />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            {isEditing && <button type="button" onClick={onClose} className="flex-1 bg-slate-800 text-slate-300 font-bold py-3 rounded-xl">Cancelar</button>}
            <button type="submit" className="flex-1 bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-950 font-bold py-3 rounded-xl transition shadow-lg shadow-fuchsia-500/20">
              {isEditing ? 'Guardar Cambios' : 'Guardar Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}