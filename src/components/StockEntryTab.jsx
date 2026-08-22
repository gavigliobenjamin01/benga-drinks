import React from 'react';
import { Search, Plus, Trash2, PackageCheck, History } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils';

export default function StockEntryTab({
  products,
  stockEntries = [],
  entrySearchTerm,
  setEntrySearchTerm,
  entryCart,
  addToEntryCart,
  updateEntryQty,
  setEntryCart,
  entryEfectivoInput,
  setEntryEfectivoInput,
  entryTransferenciaInput,
  setEntryTransferenciaInput,
  handleRegisterStockEntry,
  handleDeleteStockEntry
}) {
  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(entrySearchTerm.toLowerCase()) ||
      p.brand?.toLowerCase().includes(entrySearchTerm.toLowerCase())
  );

  // PERMITIR ESCRIBIR LA CANTIDAD DIRECTAMENTE CON EL TECLADO
  const handleDirectQtyChange = (id, value) => {
    const parsed = parseInt(value, 10);
    const newQty = isNaN(parsed) || parsed < 1 ? 1 : parsed;
    setEntryCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty: newQty } : item))
    );
  };

  const efctVal = parseFloat(entryEfectivoInput) || 0;
  const transfVal = parseFloat(entryTransferenciaInput) || 0;
  const calculatedTotal = efctVal + transfVal;

  return (
    <div className="space-y-8">
      {/* SECCIÓN REGISTRO DE INGRESO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LADO IZQUIERDO: BUSCADOR Y PRODUCTOS */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar producto para sumar stock..."
              value={entrySearchTerm}
              onChange={(e) => setEntrySearchTerm(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-fuchsia-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[450px] overflow-y-auto pr-1">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                onClick={() => addToEntryCart(prod)}
                className="bg-slate-900/80 border border-slate-800 hover:border-fuchsia-500/50 p-3.5 rounded-2xl cursor-pointer transition flex items-center justify-between group hover:scale-[1.01]"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">{prod.brand}</span>
                  <h3 className="font-semibold text-xs text-slate-100 group-hover:text-fuchsia-400 line-clamp-1">{prod.name}</h3>
                  <span className="text-[11px] font-mono text-slate-400">Stock actual: <strong className="text-white">{prod.stock}</strong></span>
                </div>
                <div className="w-7 h-7 rounded-xl bg-slate-800 group-hover:bg-fuchsia-500 group-hover:text-slate-950 text-slate-300 flex items-center justify-center transition shadow">
                  <Plus className="w-4 h-4 stroke-[3]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LADO DERECHO: DETALLE DEL INGRESO */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <h2 className="font-bold text-base text-white flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-fuchsia-400" /> Ingreso de Mercadería
            </h2>
            {entryCart.length > 0 && (
              <button onClick={() => setEntryCart([])} className="text-xs text-red-400 hover:underline">
                Vaciar
              </button>
            )}
          </div>

          {/* LISTA DE ÍTEMS A INGRESAR */}
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {entryCart.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">
                Seleccioná productos de la lista para sumar stock.
              </p>
            ) : (
              entryCart.map((item) => (
                <div key={item.id} className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-200 truncate flex-1 pr-2">{item.name}</span>
                  
                  {/* CONTROLES CON CASILLA NUMÉRICA EDITABLE DIRECTA */}
                  <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => updateEntryQty(item.id, -1)}
                      className="text-slate-400 hover:text-white px-1.5 font-bold text-sm"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => handleDirectQtyChange(item.id, e.target.value)}
                      className="w-14 text-center bg-slate-950 text-white font-mono font-bold rounded-lg border border-slate-800 py-1 text-xs focus:outline-none focus:border-fuchsia-500"
                    />
                    <button
                      onClick={() => updateEntryQty(item.id, 1)}
                      className="text-slate-400 hover:text-white px-1.5 font-bold text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* CASILLEROS SEPARADOS PARA PAGO EN EFECTIVO Y MERCADO PAGO */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-emerald-400 block mb-1 font-bold">💵 Pago Efectivo ($):</label>
                <input
                  type="number"
                  step="any"
                  placeholder="0"
                  value={entryEfectivoInput}
                  onChange={(e) => setEntryEfectivoInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-fuchsia-400 block mb-1 font-bold">💳 Pago MP / Transf ($):</label>
                <input
                  type="number"
                  step="any"
                  placeholder="0"
                  value={entryTransferenciaInput}
                  onChange={(e) => setEntryTransferenciaInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-fuchsia-500"
                />
              </div>
            </div>

            {/* TOTAL SUMADO EN TIEMPO REAL */}
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold uppercase">Costo Total Compra:</span>
              <span className="font-mono text-base font-bold text-white">{formatCurrency(calculatedTotal)}</span>
            </div>

            <button
              disabled={entryCart.length === 0 || calculatedTotal <= 0}
              onClick={handleRegisterStockEntry}
              className="w-full bg-fuchsia-500 hover:bg-fuchsia-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold py-3.5 rounded-2xl transition shadow-lg shadow-fuchsia-500/20 flex items-center justify-center gap-2"
            >
              <PackageCheck className="w-5 h-5" /> Confirmar Ingreso de Stock
            </button>
          </div>
        </div>
      </div>

      {/* SECCIÓN HISTORIAL DE INGRESOS */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <h3 className="font-bold text-base text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <History className="w-5 h-5 text-fuchsia-400" /> Historial de Ingresos de Mercadería
        </h3>

        {stockEntries.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">No hay registros de ingresos de mercadería.</p>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {stockEntries.map((entry) => {
              const efct = entry.paidEfectivo ?? (entry.paymentMethod === 'Efectivo' ? entry.totalCost : 0);
              const transf = entry.paidTransferencia ?? (entry.paymentMethod === 'Transferencia' ? entry.totalCost : 0);

              return (
                <div key={entry.id} className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-fuchsia-400">{entry.id}</span>
                      <span className="text-slate-500 text-[11px] font-mono">{formatDate(entry.date)}</span>
                      
                      {efct > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          💵 Efct: {formatCurrency(efct)}
                        </span>
                      )}
                      {transf > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
                          💳 MP: {formatCurrency(transf)}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      {entry.items?.map((i) => `${i.qty}x ${i.name}`).join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-white text-sm">
                      {formatCurrency(entry.totalCost || 0)}
                    </span>
                    <button
                      onClick={() => handleDeleteStockEntry(entry.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition"
                      title="Eliminar este ingreso y descontar el stock sumado"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}