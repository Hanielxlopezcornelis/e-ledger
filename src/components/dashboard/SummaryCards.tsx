export default function SummaryCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
      
      {/* Tarjeta de Ingresos */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <h3 className="text-sm font-semibold text-gray-700">Ingresos Mensuales</h3>
          <div className="bg-green-100 text-status-income p-2 rounded-full">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-2xl lg:text-3xl font-bold text-brand-dark">$ 1,250,000</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div className="bg-status-income h-2 rounded-full" style={{ width: '83%' }}></div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Meta mensual: $1,500,000</p>
        </div>
      </div>

      {/* Tarjeta de Egresos */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <h3 className="text-sm font-semibold text-gray-700">Egresos Mensuales</h3>
          <div className="bg-red-100 text-status-expense p-2 rounded-full">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-2xl lg:text-3xl font-bold text-brand-dark">$ 450,200</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div className="bg-status-expense h-2 rounded-full" style={{ width: '56%' }}></div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Límite recomendado: $800,000</p>
        </div>
      </div>

      {/* Tarjeta de Rendimiento (NUEVA) */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <h3 className="text-sm font-semibold text-gray-700">Rendimiento<br/><span className="text-xs font-normal">(Inversiones)</span></h3>
          <div className="bg-amber-700 text-white p-2 rounded-full">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-2xl lg:text-3xl font-bold text-brand-dark">+$ 45,000</p>
          <p className="text-sm text-status-income font-semibold mt-4">+5.2% <span className="text-xs text-gray-400 font-normal">este mes</span></p>
          <p className="text-xs text-gray-400 mt-1">Total invertido: $865,000</p>
        </div>
      </div>

      {/* Tarjeta de Saldo */}
      <div className="bg-white p-6 rounded-xl border border-brand-dark shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <h3 className="text-sm font-semibold text-gray-700">Saldo para Gastar</h3>
          <div className="bg-brand-dark text-white p-2 rounded-full">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-2xl lg:text-3xl font-bold text-brand-dark">$ 799,800</p>
          <p className="text-sm text-gray-500 mt-6">Disponible en tus cuentas</p>
        </div>
      </div>

    </div>
  );
}