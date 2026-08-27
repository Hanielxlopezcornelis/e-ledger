export default function ExpenseDistribution() {
  const categorias = [
    { nombre: 'Alimentos', porcentaje: 45, color: 'bg-brand-dark' },
    { nombre: 'Servicios y Vivienda', porcentaje: 30, color: 'bg-amber-700' },
    { nombre: 'Transporte', porcentaje: 15, color: 'bg-green-200' },
    { nombre: 'Ocio y Otros', porcentaje: 10, color: 'bg-gray-500' },
  ];

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col">
      <h2 className="text-lg font-bold text-brand-dark mb-6 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
        Distribución de Gastos
      </h2>

      <div className="flex-grow flex flex-col gap-5 justify-center">
        {categorias.map((cat, i) => (
          <div key={i}>
            <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1.5">
              <span>{cat.nombre}</span>
              <span>{cat.porcentaje}%</span>
            </div>
            <div className="w-full bg-blue-50 rounded-full h-2.5">
              <div className={`${cat.color} h-2.5 rounded-full`} style={{ width: `${cat.porcentaje}%` }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-50/50 p-4 rounded-lg text-center border border-blue-100">
        <p className="text-xs text-gray-600">
          Tus mayores gastos este mes se concentran en <span className="font-bold text-brand-dark">Alimentos</span>.
        </p>
      </div>
    </div>
  );
}