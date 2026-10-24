import React from 'react';
import { UserPlus, Trash2 } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { formatCurrency } from '../utils';

export default function ClientsTab({
  clients,
  setShowClientModal,
  handleDeleteClient,
  notify
}) {
  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Cuentas Corrientes & Fiados</h2>
          <p className="text-xs text-slate-400">Seguimiento de deudas de clientes o bares</p>
        </div>
        <button
          onClick={() => setShowClientModal(true)}
          className="bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-950 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-fuchsia-500/20"
        >
          <UserPlus className="w-4 h-4" /> Registrar Cliente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clients.map((c) => (
          <div key={c.id} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-start gap-2">
              <div>
                <h3 className="font-bold text-base text-white">{c.name}</h3>
                <p className="text-xs text-slate-400">{c.phone}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-mono font-bold text-sm px-3 py-1 rounded-full ${
                  c.debt > 0 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-fuchsia-500/10 text-fuchsia-400'
                }`}>
                  {c.debt > 0 ? `Debe: ${formatCurrency(c.debt)}` : 'Al día'}
                </span>
                <button
                  onClick={() => handleDeleteClient(c.id)}
                  title="Eliminar cliente"
                  className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {c.debt > 0 && (
              <button
                onClick={async () => {
                  await updateDoc(doc(db, 'clients', c.id), { debt: 0 });
                  notify(`Deuda saldada para ${c.name}`);
                }}
                className="w-full bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30 py-2.5 rounded-2xl text-xs font-bold transition"
              >
                Saldar Deuda Completamente
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}