import React from 'react';
import { X, CreditCard } from 'lucide-react';
import { formatCurrency } from '../../utils';

export default function SaleToPayModal({ saleToPayModal, onClose, onMarkAsPaid }) {
  if (!saleToPayModal) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 space-y-4 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-fuchsia-400" /> Cobrar Venta Fiada
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-2xl text-xs space-y-2 border border-slate-800/80">
          <div className="flex justify-between text-slate-300">
            <span>Venta ID:</span> <strong className="text-fuchsia-400 font-mono">{saleToPayModal.id}</strong>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Cliente:</span> <strong>{saleToPayModal.client}</strong>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Monto a Cobrar:</span> <strong className="text-fuchsia-400 font-mono text-sm">{formatCurrency(saleToPayModal.total)}</strong>
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-2 font-medium">¿Con qué medio abonó?</label>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => onMarkAsPaid(saleToPayModal.id, 'Efectivo')} className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-400 font-bold py-3 px-2 rounded-2xl text-xs transition flex flex-col items-center justify-center gap-1">
              Efectivo
            </button>
            <button onClick={() => onMarkAsPaid(saleToPayModal.id, 'Transferencia')} className="bg-fuchsia-500/20 hover:bg-fuchsia-500/30 border border-fuchsia-500/50 text-fuchsia-400 font-bold py-3 px-2 rounded-2xl text-xs transition flex flex-col items-center justify-center gap-1">
              Transferencia
            </button>
          </div>
        </div>

        <button onClick={onClose} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-2xl text-xs transition">
          Cancelar
        </button>
      </div>
    </div>
  );
}