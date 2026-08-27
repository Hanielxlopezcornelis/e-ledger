'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Filters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const añoActual = new Date().getFullYear().toString();
  const añoAnterior = (parseInt(añoActual) - 1).toString();

  // El estado por defecto del año ahora es siempre el actual, y eliminamos "Todos"
  const [año, setAño] = useState(searchParams.get('año') || añoActual);
  const [mes, setMes] = useState(searchParams.get('mes') || 'Todos');
  const [categoria, setCategoria] = useState(searchParams.get('categoria') || 'Todas');
  const [formaPago, setFormaPago] = useState(searchParams.get('formaPago') || 'Todas');

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Arrays de opciones limpios
  const opcionesAños = [añoActual, añoAnterior]; 
  const opcionesMeses = ['Todos', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const opcionesCategorias = ['Todas', 'Salud', 'Servicios', 'Alimentos', 'Transporte', 'Autos', 'Suscripciones', 'Entretenimiento', 'Estudios', 'Otros'];
  const opcionesPagos = ['Todas', 'Efectivo', 'Tarjeta de Débito', 'Tarjeta de Crédito', 'Transferencia', 'Inversión'];

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('año', año);
    params.set('mes', mes);
    params.set('categoria', categoria);
    params.set('formaPago', formaPago);
    
    router.push(`?${params.toString()}`, { scroll: false });
  }, [año, mes, categoria, formaPago, router]);

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const Dropdown = ({ label, value, options, stateName, setter }: any) => {
    const isOpen = openDropdown === stateName;
    return (
      <div className="flex flex-col gap-1.5 relative">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        {isOpen && <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)}></div>}
        <div
          className="relative z-20 w-full border border-gray-200 rounded-md py-2.5 px-3 text-sm text-gray-600 bg-white cursor-pointer flex justify-between items-center hover:border-brand-dark transition-colors"
          onClick={() => toggleDropdown(stateName)}
        >
          <span>{value}</span>
          <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
        {isOpen && (
          <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg z-30 overflow-hidden max-h-48 overflow-y-auto">
            {options.map((opcion: string) => (
              <div
                key={opcion}
                className={`py-2 px-3 text-sm cursor-pointer hover:bg-brand-light transition-colors ${value === opcion ? 'bg-gray-50 font-semibold text-brand-dark' : 'text-gray-700'}`}
                onClick={() => { setter(opcion); setOpenDropdown(null); }}
              >
                {opcion}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-fit sticky top-8 z-30">
      <div className="flex items-center gap-0.5 mb-6">
        <div className="w-5 h-5 bg-brand-dark text-white rounded flex items-center justify-center font-bold text-xs">F</div>
        <h3 className="text-xl font-bold text-brand-dark">iltros</h3>
      </div>
      <div className="flex flex-col gap-5">
        <Dropdown label="Año" value={año} setter={setAño} stateName="año" options={opcionesAños} />
        <Dropdown label="Mes" value={mes} setter={setMes} stateName="mes" options={opcionesMeses} />
        <Dropdown label="Categoría" value={categoria} setter={setCategoria} stateName="categoria" options={opcionesCategorias} />
        <Dropdown label="Forma de Pago" value={formaPago} setter={setFormaPago} stateName="formaPago" options={opcionesPagos} />

        <button 
          onClick={() => {
            setAño(añoActual); setMes('Todos'); setCategoria('Todas'); setFormaPago('Todas');
          }}
          className="mt-4 w-full bg-brand-light text-brand-dark font-semibold py-2.5 rounded-md hover:bg-gray-200 transition-colors text-sm"
        >
          Limpiar Filtros
        </button>
      </div>
    </div>
  );
}