import Link from 'next/link';

export default function RecentMovements() {
  const movimientos = [
    { id: 1, fecha: '17/08/2023', entidad: 'Supermercado Día', tipo: 'Alimentos', monto: '- $45,200', esIngreso: false },
    { id: 2, fecha: '15/08/2023', entidad: 'Netflix', tipo: 'Servicios', monto: '- $4,500', esIngreso: false },
    { id: 3, fecha: '12/08/2023', entidad: 'Sueldo Empresa SA', tipo: 'Ingreso', monto: '+ $1,250,000', esIngreso: true },
    { id: 4, fecha: '10/08/2023', entidad: 'Estación de Servicio YPF', tipo: 'Transporte', monto: '- $15,000', esIngreso: false },
    { id: 5, fecha: '08/08/2023', entidad: 'Farmacia Central', tipo: 'Salud', monto: '- $8,500', esIngreso: false },
  ];

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-brand-dark flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
          Movimientos Recientes
        </h2>
        <Link href="/gastos" className="text-sm font-semibold text-brand-dark hover:underline">
          Ver todos
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs font-semibold text-gray-500 border-b border-gray-100">
              <th className="pb-3 px-2">Fecha</th>
              <th className="pb-3 px-2">Entidad</th>
              <th className="pb-3 px-2">Tipo</th>
              <th className="pb-3 px-2 text-right">Monto</th>
            </tr>
          </thead>
          <tbody className="text-sm font-medium">
            {movimientos.map((mov) => (
              <tr key={mov.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-2 text-gray-600">{mov.fecha}</td>
                <td className="py-4 px-2 text-gray-800">{mov.entidad}</td>
                <td className="py-4 px-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${mov.esIngreso ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                    {mov.tipo}
                  </span>
                </td>
                <td className={`py-4 px-2 text-right font-bold ${mov.esIngreso ? 'text-status-income' : 'text-brand-dark'}`}>
                  {mov.monto}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}