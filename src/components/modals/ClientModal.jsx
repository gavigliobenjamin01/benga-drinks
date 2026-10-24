import React from 'react';
import { X } from 'lucide-react';

export default function ClientModal({ isOpen, onClose, onSubmit }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 space-y-4 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="font-bold text-base text-white">Nuevo Cliente</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Nombre / Bar:</label>
            <input required name="name" placeholder="Ej: Bar El Capitán" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Teléfono:</label>
            <input name="phone" placeholder="+54 9 11 ..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
          </div>
          <button type="submit" className="w-full bg-fuchsia-500 text-slate-950 font-bold py-3 rounded-xl transition mt-2">Guardar Cliente</button>
        </form>
      </div>
    </div>
  );
}