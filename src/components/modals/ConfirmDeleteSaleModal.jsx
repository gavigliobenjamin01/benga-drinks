import React from 'react';
import { RotateCcw } from 'lucide-react';

export default function ConfirmDeleteSaleModal({ saleToDeleteConfirm, onClose, onDelete }) {
  if (!saleToDeleteConfirm) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 space-y-4 shadow-2xl">
        <div className="flex items-center gap-3 text-red-400">
          <div className="p-2.5 bg-red-500/10 rounded-2xl border border-red-500/20">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">¿Eliminar Venta {saleToDeleteConfirm.id}?</h3>
            <p className="text-xs text-slate-400">Esta acción restaura el stock asignado.</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-2xl text-xs transition">
            Cancelar
          </button>
          <button onClick={() => onDelete(saleToDeleteConfirm.id)} className="flex-1 bg-red-500 hover:bg-red-400 text-slate-950 font-bold py-2.5 rounded-2xl text-xs transition shadow-lg shadow-red-500/20">
            Sí, Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}