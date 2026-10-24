import React from 'react';
import { X, HandCoins, Check, AlertTriangle, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils';

export default function WithdrawModal({
  isOpen,
  onClose,
  metrics,
  salaryPercentage,
  withdrawInput,
  setWithdrawInput,
  withdrawNote,
  setWithdrawNote,
  withdrawals,
  onSubmit,
  onDelete
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <HandCoins className="w-5 h-5 text-emerald-400" /> Retiro de Plata (Sueldo Personal)
            </h3>
            <p className="text-[11px] text-slate-400">Solo podés retirar la plata que te corresponde como ganancia</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-3">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Tu Sueldo Asignado ({salaryPercentage}% de Ganancia):</span>
            <strong className="font-mono text-fuchsia-400">{formatCurrency(metrics.totalSalaryProfit)}</strong>
          </div>
          <div className="flex justify-between text-xs text-slate-300">
            <span>Total Ya Retirado:</span>
            <strong className="font-mono text-amber-400">-{formatCurrency(metrics.totalWithdrawn)}</strong>
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
            <span className="text-xs font-bold text-white uppercase">Disponible para Retirar:</span>
            <span className="font-mono font-bold text-xl text-emerald-400">{formatCurrency(metrics.availableToWithdraw)}</span>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-300 block mb-1.5 font-bold">Monto a retirar ($):</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-emerald-400 font-bold">$</span>
              <input
                type="number"
                step="any"
                required
                placeholder={`Máximo ${metrics.availableToWithdraw}...`}
                value={withdrawInput}
                onChange={(e) => setWithdrawInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            {parseFloat(withdrawInput) > metrics.availableToWithdraw && (
              <p className="text-[11px] text-red-400 font-bold mt-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> No podés retirar más de lo que te corresponde.
              </p>
            )}
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1.5 font-medium">Motivo / Nota (opcional):</label>
            <input
              type="text"
              placeholder="Ej: Sueldo semana, gastos personales..."
              value={withdrawNote}
              onChange={(e) => setWithdrawNote(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={!withdrawInput || parseFloat(withdrawInput) <= 0 || parseFloat(withdrawInput) > metrics.availableToWithdraw}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-2xl transition shadow-lg shadow-emerald-500/20 disabled:bg-slate-800 disabled:text-slate-600 disabled:shadow-none flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5 stroke-[3]" /> Registrar Retiro de Plata
          </button>
        </form>

        <div className="pt-3 border-t border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-400 block uppercase">Historial de Retiros Realizados</span>
          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
            {withdrawals.length === 0 ? (
              <p className="text-[11px] text-slate-500 text-center py-3">No registraste retiros todavía.</p>
            ) : (
              withdrawals.map((w) => (
                <div key={w.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-400">{formatCurrency(w.amount)}</span>
                      <span className="text-[10px] text-slate-400">{w.note}</span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono block">{formatDate(w.date)}</span>
                  </div>
                  <button onClick={() => onDelete(w.id)} className="text-red-400 hover:text-red-300 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}