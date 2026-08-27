'use client';

export default function TransactionForm() {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full">
      <h2 className="text-lg font-bold text-brand-dark mb-6 flex items-center gap-2">
        {/* Ícono de documento */}
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Registrar Nuevo Movimiento
      </h2>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Fecha */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-700">Fecha</label>
          <input 
            type="date" 
            className="border border-gray-200 rounded-md p-2.5 text-sm text-gray-600 focus:outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark transition-all" 
            defaultValue="2026-08-17" 
          />
        </div>

        {/* Tipo de Movimiento */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-700">Tipo de Movimiento</label>
          <select className="border border-gray-200 rounded-md p-2.5 text-sm text-gray-600 focus:outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark transition-all bg-white">
            <option>Seleccione...</option>
            <option>Ingreso</option>
            <option>Gastos</option>
            <option>Ahorros</option>
            <option>Inversiones</option>
          </select>
        </div>

        {/* Monto */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-700">Monto ($)</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </span>
            <input 
              type="number" 
              placeholder="Ej: 1500" 
              className="w-full border border-gray-200 rounded-md py-2.5 pl-9 pr-3 text-sm text-gray-600 focus:outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark transition-all" 
            />
          </div>
        </div>

        {/* Lugar o Entidad */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-700">Lugar o Entidad</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </span>
            <input 
              type="text" 
              placeholder="Ej: Supermercado" 
              className="w-full border border-gray-200 rounded-md py-2.5 pl-9 pr-3 text-sm text-gray-600 focus:outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark transition-all" 
            />
          </div>
        </div>

        {/* Detalle (Ocupa 2 columnas en desktop) */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-gray-700">Detalle (Opcional)</label>
          <div className="relative">
             <span className="absolute left-3 top-3 text-gray-400">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
             </span>
             <textarea 
               placeholder="Ej: Compras del mes" 
               className="w-full border border-gray-200 rounded-md py-2.5 pl-9 pr-3 text-sm text-gray-600 focus:outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark transition-all resize-none" 
               rows={2}
             ></textarea>
          </div>
        </div>

        {/* Forma de Pago */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-700">Forma de Pago</label>
          <div className="relative">
             <span className="absolute left-3 top-2.5 text-gray-400 pointer-events-none z-10">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
             </span>
            <select className="w-full border border-gray-200 rounded-md py-2.5 pl-9 pr-3 text-sm text-gray-600 focus:outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark transition-all bg-white relative">
              <option>Efectivo</option>
              <option>Transferencia</option>
              <option>Tarjeta de Débito</option>
              <option>Tarjeta de Crédito</option>
            </select>
          </div>
        </div>

        {/* Div vacío para mantener la grilla alineada */}
        <div className="hidden md:block"></div>

        {/* Checkboxes */}
        <div className="flex items-center gap-8 md:col-span-2 pt-2">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-brand-dark focus:ring-brand-dark" />
            Pago Automático
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-brand-dark focus:ring-brand-dark" />
            Cargo Fijo
          </label>
        </div>

        {/* Botón Guardar */}
        <div className="md:col-span-2 flex justify-end mt-4 pt-4 border-t border-gray-100">
          <button 
            type="submit" 
            className="bg-brand-dark text-white px-6 py-2.5 rounded-md hover:bg-opacity-90 transition-all font-semibold text-sm flex items-center gap-2"
            onClick={(e) => e.preventDefault()} // Evita que la página recargue por ahora
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
            Guardar Movimiento
          </button>
        </div>
      </form>
    </div>
  );
}