import React from 'react';
import { Search, PackagePlus, Package, Plus, Check } from 'lucide-react';

export default function StockEntryTab({
  products,
  entrySearchTerm,
  setEntrySearchTerm,
  entryCart,
  addToEntryCart,
  updateEntryQty,
  setEntryCart,
  entryTotalCostInput,
  setEntryTotalCostInput,
  handleRegisterStockEntry
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-white">Ingreso de Mercadería</h2>
          <p className="text-xs text-slate-400">Buscá los productos existentes en inventario para sumar unidades recibidas</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar producto por nombre..."
            value={entrySearchTerm}
            onChange={(e) => setEntrySearchTerm(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-fuchsia-500 transition"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
          {products
            .filter((p) => p.name.toLowerCase().includes(entrySearchTerm.toLowerCase()))
            .map((p) => (
              <div
                key={p.id}
                onClick={() => addToEntryCart(p)}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-fuchsia-500/50 cursor-pointer hover:scale-[1.01] transition-all flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">{p.brand} · {p.category}</span>
                  <h3 className="font-semibold text-xs text-slate-100 mt-0.5">{p.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">Stock actual: <strong className="text-fuchsia-400">{p.stock} un.</strong></p>
                </div>
                <div className="bg-slate-800 p-2 rounded-xl text-fuchsia-400 font-bold hover:bg-fuchsia-500 hover:text-slate-950 transition">
                  <Plus className="w-4 h-4" />
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between space-y-5 shadow-xl">
        <div>
          <div className="flex justify-between items-center pb-4 border-b border-slate-800">
            <div>
              <h2 className="font-bold text-base text-white flex items-center gap-2">
                <PackagePlus className="w-5 h-5 text-fuchsia-400" /> Detalle de Ingreso
              </h2>
              <p className="text-[11px] text-slate-400">Productos que sumarán stock al inventario</p>
            </div>
            {entryCart.length > 0 && (
              <button onClick={() => setEntryCart([])} className="text-xs text-red-400 hover:underline font-medium">
                Vaciar
              </button>
            )}
          </div>

          <div className="space-y-2 mt-4 max-h-[250px] overflow-y-auto pr-1">
            {entryCart.length === 0 ? (
              <div className="text-center text-slate-500 py-12 space-y-2">
                <Package className="w-10 h-10 mx-auto opacity-30 text-slate-400" />
                <p className="text-xs">No elegiste ningún producto.<br />Buscá e indicá qué mercadería ingresó.</p>
              </div>
            ) : (
              entryCart.map((item) => (
                <div key={item.id} className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex-1 pr-2">
                    <p className="font-medium text-slate-200 line-clamp-1">{item.name}</p>
                    <span className="text-slate-400 text-[10px]">Stock actual: {item.stock} un.</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800">
                    <button onClick={() => updateEntryQty(item.id, -1)} className="text-slate-400 hover:text-white px-1 font-bold text-sm">-</button>
                    <span className="font-mono font-bold text-white px-1">+{item.qty} un.</span>
                    <button onClick={() => updateEntryQty(item.id, 1)} className="text-slate-400 hover:text-white px-1 font-bold text-sm">+</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div>
            <label className="text-xs text-slate-300 block mb-1.5 font-bold">
              ¿Cuánto te salió la compra/ingreso? ($):
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-fuchsia-400 font-bold">$</span>
              <input
                type="number"
                step="any"
                placeholder="Monto gastado en la mercadería..."
                value={entryTotalCostInput}
                onChange={(e) => setEntryTotalCostInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-fuchsia-500"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Este monto se descontará automáticamente de tus ingresos totales.
            </p>
          </div>

          <button
            disabled={entryCart.length === 0}
            onClick={handleRegisterStockEntry}
            className="w-full bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-950 font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-fuchsia-500/20 flex items-center justify-center gap-2 disabled:bg-slate-800 disabled:text-slate-600"
          >
            <Check className="w-5 h-5 stroke-[3]" /> Confirmar Ingreso de Mercadería
          </button>
        </div>
      </div>
    </div>
  );
}