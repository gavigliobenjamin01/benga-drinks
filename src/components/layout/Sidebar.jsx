import React from 'react';
import {
  Receipt,
  LayoutDashboard,
  Package,
  Sparkles,
  PackagePlus,
  Users
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, metrics }) {
  return (
    <aside className="w-full md:w-64 bg-slate-900/90 border-r border-slate-800/80 p-5 flex flex-col justify-between backdrop-blur-md">
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <img 
            src="/avatar.png" 
            alt="Avatar" 
            className="w-12 h-12 rounded-2xl object-cover border-2 border-fuchsia-500/50 shadow-lg shadow-fuchsia-500/30"
          />
          <div>
            <h1 className="font-bold text-lg tracking-wide text-white">Benga Drinks</h1>
            <p className="text-[11px] text-fuchsia-400 font-semibold tracking-wider">GESTIÓN DE STOCK & VENTAS</p>
          </div>
        </div>
        <nav className="space-y-1.5">
          <SidebarBtn active={activeTab === 'sales'} onClick={() => setActiveTab('sales')} icon={<Receipt />}>
            Registrar Venta
          </SidebarBtn>
          <SidebarBtn active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard />}>
            Resumen de ventas
          </SidebarBtn>
          <SidebarBtn active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<Package />} badge={metrics.lowStockCount > 0 ? `${metrics.lowStockCount}` : null}>
            Inventario & Stock
          </SidebarBtn>
          <SidebarBtn active={activeTab === 'promos'} onClick={() => setActiveTab('promos')} icon={<Sparkles />}>
            Promociones
          </SidebarBtn>
          <SidebarBtn active={activeTab === 'stock_entry'} onClick={() => setActiveTab('stock_entry')} icon={<PackagePlus />}>
            Ingreso Mercadería
          </SidebarBtn>
          <SidebarBtn active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} icon={<Users />} badge={metrics.totalPendingDebt > 0 ? 'Fiados' : null}>
            Cuentas Corrientes
          </SidebarBtn>
        </nav>
      </div>
    </aside>
  );
}

function SidebarBtn({ active, onClick, icon, children, badge }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all ${
        active
          ? 'bg-fuchsia-500 text-slate-950 font-bold shadow-lg shadow-fuchsia-500/20'
          : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
      }`}
    >
      <div className="flex items-center gap-3">
        {React.cloneElement(icon, { className: 'w-4 h-4' })}
        <span>{children}</span>
      </div>
      {badge && (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
          active ? 'bg-slate-950 text-fuchsia-400' : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
}