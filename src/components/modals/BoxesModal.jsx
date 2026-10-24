import React from 'react';
import { X, Wallet, ShieldCheck, TrendingUp, PieChart } from 'lucide-react';
import { formatCurrency } from '../../utils';

export default function BoxesModal({ isOpen, onClose, metrics, salaryPercentage, onSalaryPercentageChange }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-fuchsia-400" /> Sistema de las 3 Cajas
            </h3>
            <p className="text-[11px] text-slate-400">Control de fondos para no descapitalizar tu negocio</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-blue-500/30 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Caja 1: Costo de Reposición (Plata del Negocio)
            </span>
            <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded-full border border-blue-500/30">NO SE TOCA</span>
          </div>
          <div className="font-mono text-2xl font-bold text-white">{formatCurrency(metrics.totalCost)}</div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Es la suma exacta de lo que te costó comprar los productos vendidos. Esta plata es sagrada y no se toca, va directo a reponer stock.
          </p>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/30 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" /> Caja 2: Ganancia Neta Limpia
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">Rendimiento Real</span>
          </div>
          <div className="font-mono text-2xl font-bold text-emerald-400">{formatCurrency(metrics.netProfit)}</div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Es la diferencia directa entre lo cobrado y los costos de ventas.
          </p>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-fuchsia-500/30 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-fuchsia-400 flex items-center gap-1.5 uppercase tracking-wider">
              <PieChart className="w-4 h-4" /> Caja 3: Tu Sueldo vs. Fondo de Crecimiento
            </span>
            <span className="text-[10px] bg-fuchsia-500/20 text-fuchsia-300 font-bold px-2 py-0.5 rounded-full border border-fuchsia-500/30">Distribución</span>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs text-slate-300 font-medium">
              <span>Tu Sueldo: <strong className="text-fuchsia-400 font-mono">{salaryPercentage}%</strong></span>
              <span>Fondo Crecimiento: <strong className="text-purple-400 font-mono">{100 - salaryPercentage}%</strong></span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={salaryPercentage}
              onChange={(e) => onSalaryPercentageChange(Number(e.target.value))}
              className="w-full accent-fuchsia-500 bg-slate-800 rounded-lg cursor-pointer h-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            <div className="bg-slate-900 p-3 rounded-xl border border-fuchsia-500/20 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Tu Sueldo / Retiro</span>
              <span className="font-mono font-bold text-lg text-fuchsia-400 block mt-0.5">{formatCurrency(metrics.totalSalaryProfit)}</span>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-purple-500/20 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Reinversión</span>
              <span className="font-mono font-bold text-lg text-purple-400 block mt-0.5">{formatCurrency(metrics.netProfit * ((100 - salaryPercentage) / 100))}</span>
            </div>
          </div>
        </div>

        <button onClick={onClose} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 rounded-2xl text-xs transition">
          Cerrar
        </button>
      </div>
    </div>
  );
}