import React from 'react';
import { Plus, Pencil, Trash2, Power, Sparkles, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../utils';

export default function PromosTab({
  promos = [],
  products = [],
  openCreatePromoModal,
  openEditPromoModal,
  handleDeletePromo,
  togglePromoActive
}) {
  return (
    <div className="space-y-6">
      {/* ENCABEZADO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div>
          <h2 className="font-bold text-lg text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-fuchsia-400" /> Promociones & Combos
          </h2>
          <p className="text-xs text-slate-400">
            Creá combos especiales y calculá la ganancia de cada oferta.
          </p>
        </div>
        <button
          onClick={openCreatePromoModal}
          className="bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-950 font-bold px-4 py-2.5 rounded-2xl text-xs transition shadow-lg shadow-fuchsia-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Nueva Promo
        </button>
      </div>

      {/* GRILLA DE PROMOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promos.length === 0 ? (
          <div className="col-span-full bg-slate-900/50 border border-slate-800 rounded-3xl p-8 text-center text-slate-500 text-xs">
            No tenés promociones creadas. ¡Tocá en "Nueva Promo" para empezar!
          </div>
        ) : (
          promos.map((promo) => {
            // CÁLCULO DE COSTO Y GANANCIA DE LA PROMO
            const promoCost = (promo.items || []).reduce((acc, item) => {
              const p = products.find((prod) => prod.id === item.productId);
              return acc + (p ? p.costPrice * item.quantity : 0);
            }, 0);
            const promoProfit = (promo.price || 0) - promoCost;

            return (
              <div
                key={promo.id}
                className={`bg-slate-900/90 border rounded-3xl p-5 space-y-4 shadow-xl relative overflow-hidden transition ${
                  promo.active ? 'border-fuchsia-500/40' : 'border-slate-800 opacity-60'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-fuchsia-400 tracking-wider">
                      {promo.type === 'pack' ? '🔥 Combo / Pack' : '✨ Descuento Especial'}
                    </span>
                    <h3 className="font-bold text-base text-white">{promo.name}</h3>
                  </div>
                  <button
                    onClick={() => togglePromoActive(promo.id)}
                    className={`p-2 rounded-xl transition ${
                      promo.active
                        ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                        : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                    title={promo.active ? 'Desactivar Promo' : 'Activar Promo'}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </div>

                {promo.description && (
                  <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                    {promo.description}
                  </p>
                )}

                {/* DESGLOSE DE PRECIO Y GANANCIA DE LA PROMO */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Precio de Venta:</span>
                    <span className="font-mono text-base font-bold text-fuchsia-400">
                      {formatCurrency(promo.price)}
                    </span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-emerald-500/20 flex justify-between items-center text-xs">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> Ganancia Limpia:
                    </span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {formatCurrency(promoProfit)}
                    </span>
                  </div>
                </div>

                {/* ACCIONES */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => openEditPromoModal(promo)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Editar
                  </button>
                  <button
                    onClick={() => handleDeletePromo(promo.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition"
                    title="Eliminar Promo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}import React from 'react';
import { Plus, Pencil, Trash2, Power, Sparkles, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../utils';

export default function PromosTab({
  promos = [],
  products = [],
  openCreatePromoModal,
  openEditPromoModal,
  handleDeletePromo,
  togglePromoActive
}) {
  return (
    <div className="space-y-6">
      {/* ENCABEZADO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div>
          <h2 className="font-bold text-lg text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-fuchsia-400" /> Promociones & Combos
          </h2>
          <p className="text-xs text-slate-400">
            Creá combos especiales y calculá la ganancia de cada oferta.
          </p>
        </div>
        <button
          onClick={openCreatePromoModal}
          className="bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-950 font-bold px-4 py-2.5 rounded-2xl text-xs transition shadow-lg shadow-fuchsia-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Nueva Promo
        </button>
      </div>

      {/* GRILLA DE PROMOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promos.length === 0 ? (
          <div className="col-span-full bg-slate-900/50 border border-slate-800 rounded-3xl p-8 text-center text-slate-500 text-xs">
            No tenés promociones creadas. ¡Tocá en "Nueva Promo" para empezar!
          </div>
        ) : (
          promos.map((promo) => {
            // CÁLCULO DE COSTO Y GANANCIA DE LA PROMO
            const promoCost = (promo.items || []).reduce((acc, item) => {
              const p = products.find((prod) => prod.id === item.productId);
              return acc + (p ? p.costPrice * item.quantity : 0);
            }, 0);
            const promoProfit = (promo.price || 0) - promoCost;

            return (
              <div
                key={promo.id}
                className={`bg-slate-900/90 border rounded-3xl p-5 space-y-4 shadow-xl relative overflow-hidden transition ${
                  promo.active ? 'border-fuchsia-500/40' : 'border-slate-800 opacity-60'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-fuchsia-400 tracking-wider">
                      {promo.type === 'pack' ? '🔥 Combo / Pack' : '✨ Descuento Especial'}
                    </span>
                    <h3 className="font-bold text-base text-white">{promo.name}</h3>
                  </div>
                  <button
                    onClick={() => togglePromoActive(promo.id)}
                    className={`p-2 rounded-xl transition ${
                      promo.active
                        ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                        : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                    title={promo.active ? 'Desactivar Promo' : 'Activar Promo'}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </div>

                {promo.description && (
                  <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                    {promo.description}
                  </p>
                )}

                {/* DESGLOSE DE PRECIO Y GANANCIA DE LA PROMO */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Precio de Venta:</span>
                    <span className="font-mono text-base font-bold text-fuchsia-400">
                      {formatCurrency(promo.price)}
                    </span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-emerald-500/20 flex justify-between items-center text-xs">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> Ganancia Limpia:
                    </span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {formatCurrency(promoProfit)}
                    </span>
                  </div>
                </div>

                {/* ACCIONES */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => openEditPromoModal(promo)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Editar
                  </button>
                  <button
                    onClick={() => handleDeletePromo(promo.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition"
                    title="Eliminar Promo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}