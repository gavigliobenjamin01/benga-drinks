import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  HandCoins,
  AlertTriangle,
  Receipt,
  Calendar,
  Folder,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  CreditCard,
  MapPin,
  Sparkles,
  Trash2,
  Wallet
} from 'lucide-react';
import { formatCurrency, formatDate, formatPromoDescription } from '../utils';

export default function DashboardTab({
  sales,
  metrics,
  promos,
  products,
  setShowWithdrawModal,
  setShowBoxesModal,
  setSaleToPayModal,
  setSaleToDeleteConfirm
}) {
  const [openYears, setOpenYears] = useState({});
  const [openMonths, setOpenMonths] = useState({});

  const toggleYear = (year) => {
    setOpenYears((prev) => ({ ...prev, [year]: !prev[year] }));
  };

  const toggleMonth = (key) => {
    setOpenMonths((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const { currentWeekSales, archivedByYear } = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
    
    const currentMonday = new Date(now);
    currentMonday.setDate(diffToMonday);
    currentMonday.setHours(0, 0, 0, 0);

    const weekSales = [];
    const archived = {};

    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    sales.forEach((s) => {
      const saleDate = new Date(s.date);

      if (saleDate >= currentMonday) {
        weekSales.push(s);
      } else {
        const year = saleDate.getFullYear().toString();
        const monthName = monthNames[saleDate.getMonth()];

        if (!archived[year]) archived[year] = {};
        if (!archived[year][monthName]) archived[year][monthName] = [];
        archived[year][monthName].push(s);
      }
    });

    return { currentWeekSales: weekSales, archivedByYear: archived };
  }, [sales]);

  const renderSaleCard = (s) => (
    <div key={s.id} className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs hover:border-slate-700 transition">
      <div className="space-y-2 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-200 text-sm">{s.client}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
            s.paymentMethod === 'Fiado'
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 font-bold'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            {s.paymentMethod}
          </span>
          <span className="text-fuchsia-400 font-mono text-[11px] font-bold bg-fuchsia-500/10 px-2 py-0.5 rounded-md border border-fuchsia-500/20">
            {s.id}
          </span>

          {s.paymentMethod === 'Fiado' && (
            <button
              onClick={() => setSaleToPayModal(s)}
              className="text-[11px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2.5 py-1 rounded-xl transition flex items-center gap-1 shadow-md shadow-amber-500/20"
              title="Marcar como pagada esta venta fiada"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Marcar Pagado
            </button>
          )}
        </div>

        {s.address && (
          <div className="flex items-center gap-1 text-[11px] text-fuchsia-300 font-medium bg-slate-900 border border-fuchsia-500/30 px-2.5 py-1 rounded-xl w-fit">
            <MapPin className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
            <span>{s.address}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-400 font-medium mr-1">Detalle del Ticket:</span>
          {s.items && s.items.map((it, idx) => {
            const isPromo = it.type === 'promo' || (it.raw && it.raw.type === 'promo') || promos.some(p => p.id === it.id || p.name === it.name);

            let promoContent = '';
            if (isPromo) {
              if (it.raw?.description) {
                promoContent = it.raw.description;
              } else {
                const matchedPromo = promos.find(p => p.id === it.id || p.name === it.name);
                if (matchedPromo) {
                  promoContent = matchedPromo.description || formatPromoDescription(matchedPromo.items, products);
                }
              }
            }

            return (
              <span
                key={idx}
                className={`relative group px-2.5 py-1 rounded-xl text-[11px] font-medium flex items-center gap-1 border transition-all ${
                  isPromo
                    ? 'bg-purple-950/60 border-fuchsia-500/60 text-purple-200 hover:border-fuchsia-400 cursor-help shadow-sm shadow-fuchsia-500/20'
                    : 'bg-slate-900 border-slate-800 text-slate-200'
                }`}
              >
                <span className="text-fuchsia-400 font-bold font-mono">{it.qty}x</span> 
                <span>{it.name}</span>
                {isPromo && <Sparkles className="w-3 h-3 text-fuchsia-400 inline ml-0.5" />}

                {isPromo && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none w-max max-w-xs transition-all animate-fadeIn">
                    <div className="bg-slate-900 border border-fuchsia-500/60 text-slate-100 text-[11px] font-sans px-3 py-2 rounded-2xl shadow-2xl shadow-fuchsia-950/80 text-center whitespace-normal backdrop-blur-md">
                      <span className="text-[10px] text-fuchsia-400 font-bold uppercase tracking-wider block mb-0.5">
                        📦 Contenido del Combo:
                      </span>
                      <span className="text-slate-200 font-medium">
                        {promoContent || 'Detalle del combo registrado'}
                      </span>
                    </div>
                    <div className="w-2.5 h-2.5 bg-slate-900 border-r border-b border-fuchsia-500/60 rotate-45 -mt-1.5"></div>
                  </div>
                )}
              </span>
            );
          })}
        </div>

        <p className="text-slate-500 text-[10px] font-mono flex items-center gap-1 pt-0.5">
          <Calendar className="w-3 h-3 text-slate-500" /> {formatDate(s.date)}
        </p>
      </div>

      <div className="flex items-center gap-4 self-end md:self-center">
        <div className="text-right font-mono">
          <div className="font-bold text-fuchsia-400 text-base">{formatCurrency(s.total)}</div>
          <div className="text-[10px] text-purple-400">+Ganancia: {formatCurrency(s.profit)}</div>
        </div>

        <button
          onClick={() => setSaleToDeleteConfirm(s)}
          title="Eliminar esta venta y restaurar stock"
          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Resumen Comercial</h2>
          <p className="text-xs text-slate-400">Estado general de ingresos, ganancias e historial</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-[1.02]"
          >
            <HandCoins className="w-4 h-4 text-slate-950" /> Retirar Plata (Sueldo)
          </button>
          <button
            onClick={() => setShowBoxesModal(true)}
            className="bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-400 hover:to-purple-500 text-slate-950 font-extrabold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-fuchsia-500/25 transition-all transform hover:scale-[1.02]"
          >
            <Wallet className="w-4 h-4 text-slate-950" /> Cajas (3 Cajas)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Ingresos Totales (Netos)"
          value={formatCurrency(metrics.totalRevenue)}
          icon={<DollarSign className="text-fuchsia-400" />}
          onClick={() => setShowBoxesModal(true)}
          hint="Toca para ver Cajas"
        />
        <KpiCard
          title="Ganancia Neta Limpia"
          value={formatCurrency(metrics.netProfit)}
          icon={<TrendingUp className="text-purple-400" />}
          onClick={() => setShowBoxesModal(true)}
          hint="Toca para ver Cajas"
        />
        <KpiCard
          title="Retiro de Plata (Disponible)"
          value={formatCurrency(metrics.availableToWithdraw)}
          icon={<HandCoins className="text-emerald-400" />}
          onClick={() => setShowWithdrawModal(true)}
          hint="Toca para retirar sueldo"
        />
        <KpiCard
          title="Productos Bajo Stock"
          value={metrics.lowStockCount.toString()}
          icon={<AlertTriangle className="text-red-400" />}
          onClick={() => setShowBoxesModal(true)}
          hint="Toca para ver Cajas"
        />
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-6 shadow-xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Receipt className="w-4 h-4 text-fuchsia-400" /> Historial de Ventas
          </h3>
          <span className="text-xs text-slate-500">{sales.length} ventas en total</span>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-fuchsia-400" />
              <h4 className="font-bold text-xs text-white uppercase tracking-wider">
                Ventas de la Semana Actual
              </h4>
            </div>
            <span className="text-[10px] bg-fuchsia-500/20 text-fuchsia-400 font-bold px-2.5 py-0.5 rounded-full border border-fuchsia-500/30">
              {currentWeekSales.length} ventas
            </span>
          </div>

          <div className="space-y-2.5">
            {currentWeekSales.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6 bg-slate-950/30 rounded-2xl border border-slate-800/40">
                No hay ventas registradas en esta semana aún.
              </p>
            ) : (
              currentWeekSales.map((s) => renderSaleCard(s))
            )}
          </div>
        </div>

        {Object.keys(archivedByYear).length > 0 && (
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Folder className="w-4 h-4 text-purple-400" /> Historial Archivado
            </h4>

            <div className="space-y-3">
              {Object.keys(archivedByYear)
                .sort((a, b) => b - a)
                .map((year) => {
                  const isYearOpen = !!openYears[year];
                  const monthKeys = Object.keys(archivedByYear[year]);
                  const yearTotalSales = monthKeys.reduce(
                    (acc, m) => acc + archivedByYear[year][m].length,
                    0
                  );

                  return (
                    <div key={year} className="bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden">
                      <button
                        onClick={() => toggleYear(year)}
                        className="w-full flex items-center justify-between p-3.5 bg-slate-900/90 hover:bg-slate-800/80 transition text-left text-xs font-bold text-white"
                      >
                        <div className="flex items-center gap-2.5">
                          {isYearOpen ? (
                            <FolderOpen className="w-4 h-4 text-purple-400" />
                          ) : (
                            <Folder className="w-4 h-4 text-purple-400" />
                          )}
                          <span>Año {year}</span>
                          <span className="text-[10px] font-normal text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
                            {yearTotalSales} ventas
                          </span>
                        </div>
                        {isYearOpen ? (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </button>

                      {isYearOpen && (
                        <div className="p-3 space-y-2 bg-slate-950/40 border-t border-slate-800/60">
                          {monthKeys.map((monthName) => {
                            const monthKey = `${year}-${monthName}`;
                            const isMonthOpen = !!openMonths[monthKey];
                            const monthSales = archivedByYear[year][monthName];

                            return (
                              <div key={monthKey} className="border border-slate-800/80 rounded-xl overflow-hidden">
                                <button
                                  onClick={() => toggleMonth(monthKey)}
                                  className="w-full flex items-center justify-between p-2.5 bg-slate-900/60 hover:bg-slate-900 transition text-left text-xs font-semibold text-slate-200"
                                >
                                  <div className="flex items-center gap-2">
                                    {isMonthOpen ? (
                                      <FolderOpen className="w-3.5 h-3.5 text-fuchsia-400" />
                                    ) : (
                                      <Folder className="w-3.5 h-3.5 text-fuchsia-400" />
                                    )}
                                    <span>{monthName} {year}</span>
                                    <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full">
                                      {monthSales.length} ventas
                                    </span>
                                  </div>
                                  {isMonthOpen ? (
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                  ) : (
                                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                  )}
                                </button>

                                {isMonthOpen && (
                                  <div className="p-2 space-y-2 bg-slate-950/80 border-t border-slate-800/60">
                                    {monthSales.map((s) => renderSaleCard(s))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon, onClick, hint }) {
  return (
    <div
      onClick={onClick}
      className={`bg-slate-900/90 border border-slate-800 rounded-3xl p-5 flex justify-between items-start shadow-xl transition-all ${
        onClick ? 'cursor-pointer hover:border-fuchsia-500/60 hover:scale-[1.02]' : ''
      }`}
    >
      <div>
        <span className="text-xs text-slate-400 font-medium">{title}</span>
        <div className="font-mono text-xl font-bold text-slate-100 mt-1">{value}</div>
        {hint && <span className="text-[10px] text-fuchsia-400 font-semibold block mt-1">{hint}</span>}
      </div>
      <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 shadow">{icon}</div>
    </div>
  );
}