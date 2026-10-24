import React from 'react';
import { X, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../utils';

export default function WebOrdersModal({ isOpen, onClose, webOrders, onAccept, onReject }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-fuchsia-400" /> Pedidos Web Entrantes
            </h3>
            <p className="text-xs text-slate-400">Solicitudes realizadas por clientes desde la Web</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {webOrders.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No hay pedidos pendientes en este momento.</p>
          ) : (
            webOrders.map((ord) => (
              <div key={ord.id} className="bg-slate-950 p-4 rounded-2xl border border-fuchsia-500/30 space-y-3">
                <div className="flex justify-between items-start text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{ord.clientName || 'Cliente Web'}</span>
                      {ord.orderNumber && (
                        <span className="font-mono text-xs font-bold text-fuchsia-400 bg-fuchsia-500/10 px-2 py-0.5 rounded-lg border border-fuchsia-500/25">
                          #{ord.orderNumber}
                        </span>
                      )}
                    </div>
                    <span className="text-slate-400 text-[11px] block mt-0.5">{ord.address || 'Sin dirección especificada'}</span>
                    <span className="text-fuchsia-400 text-[10px] font-mono">Pago: {ord.paymentMethod || 'Efectivo'}</span>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold text-base">
                    {formatCurrency(ord.total || 0)}
                  </span>
                </div>

                <div className="border-t border-slate-800/80 pt-2 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Detalle del Pedido:</span>
                  {ord.items?.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-slate-300">
                      <span>{it.qty}x {it.name}</span>
                      <span className="font-mono text-slate-400">{formatCurrency((it.price || 0) * it.qty)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <button onClick={() => onReject(ord.id)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition">
                    Rechazar
                  </button>
                  <button onClick={() => onAccept(ord)} className="flex-1 bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition shadow-lg shadow-fuchsia-500/20 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Aceptar e Importar a Caja
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}