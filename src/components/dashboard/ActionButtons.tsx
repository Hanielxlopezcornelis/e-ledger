import Link from 'next/link';

export default function ActionButtons() {
  return (
    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8 pb-8">
      
      {/* Botón Ir a Mis Gastos */}
      <Link 
        href="/gastos" 
        className="flex items-center gap-2 border-2 border-brand-dark text-brand-dark px-6 py-3 rounded-md font-semibold hover:bg-gray-50 transition-colors w-full sm:w-auto justify-center"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        Ir a Mis Gastos (Detalle Completo)
      </Link>

      {/* Botón Registrar Nuevo Movimiento */}
      <Link 
        href="/registrar" // Asumimos que ahora habrá una página nueva para esto
        className="flex items-center gap-2 bg-brand-dark text-white px-6 py-3 rounded-md font-semibold hover:bg-opacity-90 transition-colors w-full sm:w-auto justify-center"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        Registrar Nuevo Movimiento
      </Link>

    </div>
  );
}