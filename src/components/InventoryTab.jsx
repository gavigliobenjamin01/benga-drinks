import React from 'react';
import { Plus, Pencil, Trash2, HandCoins } from 'lucide-react';
import { formatCurrency } from '../utils';

export default function InventoryTab({
  inventoryCategories,
  inventoryCategoryFilter,
  setInventoryCategoryFilter,
  sortedAndFilteredInventory,
  metrics,
  setShowWithdrawModal,
  setShowProductModal,
  handleAdjustStock,
  setEditingProduct,
  handleDeleteProduct
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Inventario de Productos</h2>
          <p className="text-xs text-slate-400">Control rápido de precios, stock e ingresos (Orden alfabético A-Z)</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="bg-slate-900/90 hover:bg-slate-800 border border-emerald-500/40 px-4 py-2 rounded-2xl text-xs text-left transition-all shadow-lg"
          >
            <span className="text-emerald-400 block text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <HandCoins className="w-3.5 h-3.5" /> Retiro de Plata (Disponible)
            </span>
            <span className="text-white font-mono font-bold text-sm block mt-0.5">
              {formatCurrency(metrics.availableToWithdraw)}
            </span>
          </button>

          <div className="bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-2xl text-xs">
            <span className="text-slate-400 block text-[10px] font-medium uppercase tracking-wider">Capital en Stock (Costo)</span>
            <span className="text-fuchsia-400 font-mono font-bold text-sm block">
              {formatCurrency(metrics.stockValuation)}
            </span>
          </div>

          <button
            onClick={() => setShowProductModal(true)}
            className="bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-950 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-fuchsia-500/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Nuevo Producto
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {inventoryCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setInventoryCategoryFilter(cat)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              inventoryCategoryFilter === cat
                ? 'bg-fuchsia-500 text-slate-950 border-fuchsia-500 font-bold shadow-md shadow-fuchsia-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="p-4">Producto</th>
                <th className="p-4">Categoría</th>
                <th className="p-4 font-mono">Costo</th>
                <th className="p-4 font-mono">P. Venta</th>
                <th className="p-4 font-mono text-cyan-400">P. Combo</th>
                <th className="p-4 text-center">Stock Actual</th>
                <th className="p-4 text-center">Ajuste Rápido</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sortedAndFilteredInventory.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500 text-xs">
                    No hay productos para mostrar en esta categoría.
                  </td>
                </tr>
              ) : (
                sortedAndFilteredInventory.map((p) => {
                  const isLowStock = p.stock <= p.minStock;
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition">
                      <td 
                        className={`p-4 font-semibold ${isLowStock ? 'text-red-400 font-bold' : 'text-slate-200'}`}
                        style={{ color: isLowStock ? '#f87171' : undefined }}
                      >
                        {p.name}
                      </td>
                      <td className="p-4 text-slate-400">
                        <span className="bg-slate-950 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-lg text-[10px] font-semibold">
                          {p.category}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-slate-300">{formatCurrency(p.costPrice)}</td>
                      <td className="p-4 font-mono text-fuchsia-400 font-bold">{formatCurrency(p.sellPrice)}</td>
                      <td className="p-4 font-mono text-cyan-400 font-bold">
                        {p.comboPrice !== undefined && p.comboPrice !== null && p.comboPrice !== ''
                          ? formatCurrency(p.comboPrice)
                          : '-'}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isLowStock
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {p.stock} un.
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center items-center gap-1.5">
                          <button onClick={() => handleAdjustStock(p.id, -1)} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold text-xs">-</button>
                          <button onClick={() => handleAdjustStock(p.id, 1)} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold text-xs">+</button>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setEditingProduct(p)}
                            title="Editar precios y producto"
                            className="p-2 rounded-xl bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-400 transition"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            title="Eliminar producto"
                            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}