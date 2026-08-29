import React from 'react';
import {
  Wallet,
  TrendingUp,
  AlertTriangle,
  HandCoins,
  CreditCard,
  Trash2,
  History,
  MapPin,
  Edit // <-- Importamos el ícono de edición
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils';

export default function DashboardTab({
  sales,
  metrics,
  promos = [],
  products = [],
  setShowWithdrawModal,
  setShowBoxesModal,
  setSaleToPayModal,
  setSaleToDeleteConfirm,
  onReopenSale // <-- Recibimos la función desde App.jsx
}) {
  return (
    <div className="space-y-6">
      {/* TARJETAS PRINCIPALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TARJETA INGRESOS TOTALES CON DESGLOSE */}
        <div
          onClick={() => setShowBoxesModal(true)}
          className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl cursor-pointer hover:border-fuchsia-500/50 transition space-y-3 group shadow-xl"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-slate-400 font-medium block">Ingresos Totales (Netos)</span>
              <div className="font-mono text-2xl font-bold text-white mt-1 group-hover:text-fuchsia-400 transition">
                {formatCurrency(metrics.totalRevenue)}
              </div>
            </div>
            <div className="p-2.5 bg-fuchsia-500/10 text-fuchsia-400 rounded-2xl border border-fuchsia-500/20">
              <Wallet className="w-5 h-5" />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800/60">
              <span className="text-slate-400 block">💵 Efectivo:</span>
              <strong className="font-mono text-emerald-400 text-xs block mt-0.5">
                {formatCurrency(metrics.efectivoRevenue || 0)}
              </strong>
            </div>

            <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800/60">
              <span className="text-slate-400 block">💳 MP / Transf:</span>
              <strong className="font-mono text-fuchsia-400 text-xs block mt-0.5">
                {formatCurrency(metrics.transferenciaRevenue || 0)}
              </strong>
            </div>
          </div>

          <p className="text-[10px] text-slate-500">Toca para ver el detalle de las Cajas</p>
        </div>

        {/* GANANCIA NETA LIMPIA */}
        <div
          onClick={() => setShowBoxesModal(true)}
          className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl cursor-pointer hover:border-emerald-500/50 transition space-y-2 group shadow-xl"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-slate-400 font-medium block">Ganancia Neta Limpia</span>
              <div className="font-mono text-2xl font-bold text-emerald-400 mt-1">
                {formatCurrency(metrics.netProfit)}
              </div>
            </div>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 pt-2 border-t border-slate-800/80">Toca para ver las Cajas</p>
        </div>

        {/* SUELDO DISPONIBLE PARA RETIRAR */}
        <div
          onClick={() => setShowWithdrawModal(true)}
          className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl cursor-pointer hover:border-emerald-500/50 transition space-y-2 group shadow-xl"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-slate-400 font-medium block">Sueldo Disponible</span>
              <div className="font-mono text-2xl font-bold text-emerald-400 mt-1">
                {formatCurrency(metrics.availableToWithdraw)}
              </div>
            </div>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
              <HandCoins className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 pt-2 border-t border-slate-800/80">Toca para Retirar Plata</p>
        </div>

        {/* DEUDAS PENDIENTES (FIADOS) */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-2 shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-slate-400 font-medium block">Deudas Fiadas</span>
              <div className="font-mono text-2xl font-bold text-amber-400 mt-1">
                {formatCurrency(metrics.totalPendingDebt)}
              </div>
            </div>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 pt-2 border-t border-slate-800/80">Total a cobrar en Cuentas Corrientes</p>
        </div>
      </div>

      {/* HISTORIAL DE VENTAS RECIENTES */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <h2 className="font-bold text-base text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <History className="w-5 h-5 text-fuchsia-400" /> Historial de Ventas
        </h2>

        {sales.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8">No registraste ventas todavía.</p>
        ) : (
          <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
            {sales.map((sale) => (
              <div key={sale.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-sm">{sale.client}</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                      sale.paymentMethod === 'Fiado'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : sale.paymentMethod === 'Transferencia'
                        ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {sale.paymentMethod}
                    </span>
                    <span className="text-slate-500 font-mono text-[10px]">{sale.id}</span>
                  </div>

                  {/* ETIQUETAS CON TOOLTIP PERSONALIZADO VIOLETA */}
                  <div className="flex flex-wrap gap-1.5 my-2">
                    {sale.items?.map((item, idx) => {
                      const promoObj = promos.find((p) => p.id === item.id || p.name === item.name);
                      const promoDesc = item.raw?.description || promoObj?.description || '';

                      return (
                        <div key={idx} className="relative group/tooltip inline-block">
                          <span
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-medium border transition cursor-pointer flex items-center gap-1 ${
                              item.type === 'promo' || promoObj
                                ? 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/40 hover:bg-fuchsia-500/30 font-bold shadow-sm shadow-fuchsia-500/10'
                                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            {item.qty}x {item.name}
                          </span>

                          {/* MINI CARTEL FLOTANTE VIOLETA */}
                          {promoDesc && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:flex flex-col items-center z-50 pointer-events-none transition-all duration-200">
                              <div className="bg-slate-950/95 border border-fuchsia-500/60 text-fuchsia-200 text-[11px] py-1.5 px-3 rounded-xl shadow-2xl shadow-fuchsia-950/80 whitespace-nowrap backdrop-blur-md font-medium flex items-center gap-1.5">
                                <span className="text-fuchsia-400 font-bold uppercase text-[9px] bg-fuchsia-500/20 px-1.5 py-0.5 rounded border border-fuchsia-500/30">
                                  Incluye
                                </span>
                                <span>{promoDesc}</span>
                              </div>
                              {/* Flechita inferior del cartelito */}
                              <div className="w-2 h-2 bg-slate-950 border-r border-b border-fuchsia-500/60 rotate-45 -mt-1 shadow-sm"></div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {sale.address && (
                    <span className="text-slate-400 text-[10px] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-fuchsia-400" /> {sale.address}
                    </span>
                  )}

                  <span className="text-[10px] text-slate-500 font-mono block">{formatDate(sale.date)}</span>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <span className="font-mono font-bold text-lg text-fuchsia-400">
                    {formatCurrency(sale.total)}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {sale.paymentMethod === 'Fiado' && (
                      <button
                        onClick={() => setSaleToPayModal(sale)}
                        className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Cobrar
                      </button>
                    )}

                    {/* BOTÓN EDITAR / REABRIR VENTA */}
                    <button
                      onClick={() => onReopenSale && onReopenSale(sale)}
                      className="p-2 text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 rounded-xl transition"
                      title="Editar / Reabrir venta en la Caja"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setSaleToDeleteConfirm(sale)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition"
                      title="Eliminar venta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}