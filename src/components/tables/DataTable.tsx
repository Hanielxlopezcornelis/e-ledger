'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const getCategoriaStyles = (categoria: string) => {
  switch (categoria) {
    case 'Servicios': return 'bg-blue-50 text-blue-600';
    case 'Alimentos': return 'bg-amber-50 text-amber-600';
    case 'Salud': return 'bg-rose-50 text-rose-600';
    case 'Suscripciones': return 'bg-purple-50 text-purple-600';
    case 'Transporte': return 'bg-teal-50 text-teal-600';
    case 'Autos': return 'bg-slate-100 text-slate-700';
    default: return 'bg-gray-100 text-gray-600';
  }
};

const ModernCheckbox = ({ checked, onChange }: { checked: boolean, onChange: (e: any) => void }) => (
  <label className="relative flex items-center cursor-pointer p-1">
    <input type="checkbox" className="peer sr-only" checked={checked} onChange={onChange} />
    <div className="w-5 h-5 border-2 border-gray-300 rounded-md peer-checked:bg-brand-dark peer-checked:border-brand-dark transition-all flex items-center justify-center bg-white shadow-sm">
      <svg className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
  </label>
);

export default function DataTable() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Leer la URL para los filtros
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [movimientosCrudos, setMovimientosCrudos] = useState<any[]>([]); // Guardamos todo acá
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const tipoUiMap: Record<string, string> = { 'EXPENSE': 'Gasto', 'INCOME': 'Ingreso', 'SAVING': 'Ahorro', 'INVESTMENT': 'Inversión' };
  const categoriaUiMap: Record<string, string> = { 'HEALTH': 'Salud', 'UTILITIES': 'Servicios', 'FOOD': 'Alimentos', 'TRANSPORT': 'Transporte', 'AUTO': 'Autos', 'APPS': 'Suscripciones', 'ENTERTAINMENT': 'Entretenimiento', 'EDUCATION': 'Estudios', 'OTHER': 'Otros', 'INCOME': 'Otros' };
  const pagoUiMap: Record<string, string> = { 'CREDIT_CARD': 'Tarjeta de Crédito', 'DEBIT_CARD': 'Tarjeta de Débito', 'CASH': 'Efectivo', 'TRANSFER': 'Transferencia' };

  useEffect(() => {
    const usuarioActivo = localStorage.getItem('usuario_eledger');
    if (usuarioActivo) {
      const datosUsuario = JSON.parse(usuarioActivo);
      fetchMovimientos(datosUsuario.id);
    }
  }, []);

  const fetchMovimientos = async (userId: string) => {
    try {
      const response = await fetch(`/api/transactions?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        
        const transaccionesFormateadas = data.map((tx: any) => {
          const fechaObj = new Date(tx.date);
          const fechaFormateada = fechaObj.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
          const esGasto = tx.type === 'EXPENSE';
          
          return {
            id: tx.id,
            fechaCruda: tx.date, // Guardamos la fecha real para el filtro
            fecha: fechaFormateada,
            entidad: tx.entity,
            detalle: tx.detail || '-',
            pago: pagoUiMap[tx.paymentMethod] || tx.paymentMethod,
            cuotas: tx.installments ? `${tx.installments}` : '-',
            categoria: categoriaUiMap[tx.category] || tx.category,
            tipo: tipoUiMap[tx.type] || tx.type,
            monto: esGasto ? `- $${tx.amount.toLocaleString('es-AR')}` : `+ $${tx.amount.toLocaleString('es-AR')}`,
            colorMonto: esGasto ? 'text-brand-dark' : 'text-green-500',
            icono: tx.entity.charAt(0).toUpperCase()
          };
        });
        setMovimientosCrudos(transaccionesFormateadas);
      }
    } catch (error) {
      console.error("Error al cargar la tabla:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // MOTOR DE FILTRADO EN TIEMPO REAL
  // ==========================================
  const mesesDelAño = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
  const filtroAño = searchParams.get('año') || new Date().getFullYear().toString();
  const filtroMes = searchParams.get('mes') || 'Todos';
  const filtroCategoria = searchParams.get('categoria') || 'Todas';
  const filtroPago = searchParams.get('formaPago') || 'Todas';

  // Aplicamos los filtros al array original
  const movimientosFiltrados = movimientosCrudos.filter(mov => {
    const fechaObj = new Date(mov.fechaCruda);
    const movYear = fechaObj.getUTCFullYear().toString();
    const movMonth = mesesDelAño[fechaObj.getUTCMonth()];

    if (filtroAño !== 'Todos' && movYear !== filtroAño) return false;
    if (filtroMes !== 'Todos' && movMonth !== filtroMes) return false;
    if (filtroCategoria !== 'Todas' && mov.categoria !== filtroCategoria) return false;
    if (filtroPago !== 'Todas' && mov.pago !== filtroPago) return false;

    return true;
  });

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(movimientosFiltrados.map(m => m.id));
    else setSelectedIds([]);
  };

  const handleEliminarSeleccionados = async () => {
    const confirmMsg = selectedIds.length === 1 ? '¿Estás seguro de eliminar este movimiento?' : `¿Estás seguro de eliminar estos ${selectedIds.length} movimientos?`;
    if (window.confirm(confirmMsg)) {
      try {
        await Promise.all(selectedIds.map(id => fetch(`/api/transactions?id=${id}`, { method: 'DELETE' })));
        setMovimientosCrudos(movimientosCrudos.filter(mov => !selectedIds.includes(mov.id)));
        setSelectedIds([]);
      } catch (error) {
        alert('Hubo un error al eliminar. Intentá de nuevo.');
      }
    }
  };

  const toggleExpand = (id: string) => setExpandedId(expandedId === id ? null : id);

  return (
    <div className="w-full bg-white md:rounded-xl md:border border-gray-100 md:shadow-sm overflow-hidden flex flex-col relative">
      
      {/* BARRA DE ACCIONES SUPERIOR */}
      {selectedIds.length > 0 && (
        <div className="bg-brand-light/40 border-b border-brand-light px-6 py-3 flex items-center justify-between sticky top-0 z-20">
          <span className="text-sm font-semibold text-brand-dark">{selectedIds.length} seleccionado(s)</span>
          <div className="flex gap-3">
            <button
              disabled={selectedIds.length !== 1}
              onClick={() => router.push(`/registrar?edit=${selectedIds[0]}`)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Editar
            </button>
            <button onClick={handleEliminarSeleccionados} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Eliminar
            </button>
          </div>
        </div>
      )}

      {/* VERSIÓN MÓVIL */}
      <div className="md:hidden flex flex-col">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="font-bold text-brand-dark">Tus Movimientos</h2>
          <span className="text-xs font-semibold text-gray-500">{movimientosFiltrados.length} movs.</span>
        </div>
        <div className="flex flex-col">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500 text-sm">Cargando tus movimientos...</div>
          ) : movimientosFiltrados.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">No hay movimientos que coincidan con estos filtros.</div>
          ) : (
            movimientosFiltrados.map((mov) => (
              <div key={mov.id} className={`border-b border-gray-100 last:border-0 transition-colors ${selectedIds.includes(mov.id) ? 'bg-brand-light/10' : ''}`}>
                <div className="flex items-center justify-between p-5 bg-transparent active:bg-gray-50 cursor-pointer transition-colors" onClick={() => toggleExpand(mov.id)}>
                  <div className="flex items-center gap-4">
                    <div onClick={(e) => e.stopPropagation()}>
                      <ModernCheckbox checked={selectedIds.includes(mov.id)} onChange={() => handleSelectOne(mov.id)} />
                    </div>
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 ${mov.colorMonto === 'text-green-500' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-brand-dark'}`}>
                      {mov.icono}
                    </div>
                    <div>
                      <h3 className="font-bold text-brand-dark text-sm leading-tight mb-0.5">{mov.entidad}</h3>
                      <p className="text-xs text-gray-500">{mov.fecha}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`font-bold text-sm ${mov.colorMonto}`}>{mov.monto}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* VERSIÓN ESCRITORIO */}
      <div className="hidden md:block w-full overflow-x-auto pb-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
        <table className="w-full text-sm text-left min-w-max">
          <thead className="text-xs text-brand-dark uppercase bg-slate-50 border-b border-gray-200">
            <tr>
              <th className="pl-6 pr-3 py-4 w-12"><ModernCheckbox checked={movimientosFiltrados.length > 0 && selectedIds.length === movimientosFiltrados.length} onChange={handleSelectAll} /></th>
              <th className="px-3 py-4 font-bold">Fecha</th>
              <th className="px-3 py-4 font-bold">Entidad</th>
              <th className="px-3 py-4 font-bold">Detalle</th>
              <th className="px-3 py-4 font-bold">Pago</th>
              <th className="px-3 py-4 font-bold text-center">Cuotas</th>
              <th className="px-3 py-4 font-bold text-center">Categoría</th>
              <th className="px-3 py-4 font-bold text-center">Movimiento</th>
              <th className="pl-3 pr-6 py-4 font-bold text-right">Monto</th>
            </tr>
          </thead>
          <tbody className="text-gray-600">
            {isLoading ? (
              <tr><td colSpan={9} className="px-6 py-12 text-center text-gray-500">Cargando tus datos de forma segura...</td></tr>
            ) : movimientosFiltrados.length === 0 ? (
              <tr><td colSpan={9} className="px-6 py-12 text-center text-gray-500">No hay movimientos que coincidan con estos filtros.</td></tr>
            ) : (
              movimientosFiltrados.map((mov) => (
                <tr key={mov.id} className={`border-b border-gray-50 transition-colors ${selectedIds.includes(mov.id) ? 'bg-brand-light/20' : 'hover:bg-slate-50/50'}`}>
                  <td className="pl-6 pr-3 py-4"><ModernCheckbox checked={selectedIds.includes(mov.id)} onChange={() => handleSelectOne(mov.id)} /></td>
                  <td className="px-3 py-4 whitespace-nowrap">{mov.fecha}</td>
                  <td className="px-3 py-4 font-semibold text-brand-dark whitespace-nowrap">{mov.entidad}</td>
                  <td className="px-3 py-4 text-gray-500 max-w-[150px] truncate" title={mov.detalle}>{mov.detalle}</td>
                  <td className="px-3 py-4 whitespace-nowrap">{mov.pago}</td>
                  <td className="px-3 py-4 text-center">{mov.cuotas}</td>
                  <td className="px-3 py-4 text-center"><span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${getCategoriaStyles(mov.categoria)}`}>{mov.categoria}</span></td>
                  <td className="px-3 py-4 text-center"><span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 whitespace-nowrap">{mov.tipo}</span></td>
                  <td className={`pl-3 pr-6 py-4 font-bold text-right whitespace-nowrap ${mov.colorMonto}`}>{mov.monto}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}