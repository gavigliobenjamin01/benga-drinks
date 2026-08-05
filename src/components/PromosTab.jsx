import React from 'react';
import { Plus, Pencil, Trash2, ToggleRight, ToggleLeft, Sparkles } from 'lucide-react';
import { formatCurrency } from '../utils';

export default function PromosTab({
  promos,
  openCreatePromoModal,
  openEditPromoModal,
  handleDeletePromo,
  togglePromoActive
}) {
  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Promociones & Combos</h2>
          <p className="text-xs text-slate-400">Armá packs especiales y precios de agregados en combo</p>
        </div>
        <button
          onClick={openCreatePromoModal}
          className="bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-950 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-fuchsia-500/20"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Crear Promo / Agregado
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promos.map((p) => {
          const isAddon = p.type === 'agregado' || p.type === 'adicional';

          return (
            <div key={p.id} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
              <div className="flex justify-between items-start">
                <div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                    isAddon 
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                      : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {p.type}
                  </span>
                  <h3 className="font-bold text-base text-white mt-2">{p.name}</h3>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditPromoModal(p)}
                    title="Modificar promoción"
                    className="p-2 rounded-xl bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-400 transition"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePromo(p.id)}
                    title="Eliminar promoción"
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => togglePromoActive(p.id)} title={p.active ? 'Desactivar promo' : 'Activar promo'}>
                    {p.active ? <ToggleRight className="w-7 h-7 text-fuchsia-400" /> : <ToggleLeft className="w-7 h-7 text-slate-600" />}
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-400">{p.description}</p>

              <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex justify-between items-center font-mono">
                {isAddon ? (
                  <>
                    <div className="text-xs text-slate-400">
                      <span>Precio regular: <span className="line-through text-slate-500">{formatCurrency(p.regularPrice || p.price)}</span></span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-amber-400 font-sans block">Con Combo:</span>
                      <span className="text-fuchsia-400 font-bold text-lg">{formatCurrency(p.comboPrice || p.price)}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-xs text-slate-400">Precio Promo:</span>
                    <span className="text-fuchsia-400 font-bold text-lg">{formatCurrency(p.price)}</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}