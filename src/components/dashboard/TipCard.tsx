export default function TipCard() {
  return (
    <div className="bg-blue-50 rounded-xl border border-blue-100 flex flex-col justify-end p-6 h-full min-h-[300px] relative overflow-hidden">
      
      {/* Fondo decorativo (Simulación del gráfico) */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-100/30 to-blue-300/30"></div>
      
      {/* Cajas de fondo abstractas para darle el estilo de los "bloques" */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-200/50 rounded-lg rotate-12 blur-md"></div>
      <div className="absolute top-1/2 right-10 w-24 h-24 bg-indigo-200/50 rounded-lg -rotate-12 blur-md"></div>

      {/* Tarjeta de texto superpuesta */}
      <div className="relative z-10 bg-white p-5 rounded-lg shadow-sm border border-gray-100">
        <h4 className="font-bold text-brand-dark text-sm flex items-center gap-2 mb-2">
          {/* Ícono de bombilla */}
          <svg className="w-4 h-4 text-brand-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Consejo del mes
        </h4>
        <p className="text-xs text-gray-600 leading-relaxed">
          Registrar tus gastos en el momento ayuda a mantener un control exacto. ¡No dejes que se acumulen los tickets!
        </p>
      </div>
    </div>
  );
}