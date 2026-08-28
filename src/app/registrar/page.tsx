'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import ProtectedRoute from "../../components/layout/ProtectedRoute";
import * as XLSX from 'xlsx';

function RegistrarFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams) {
      setEditId(searchParams.get('edit'));
    }
  }, [searchParams]); 

  // Referencia para el input de archivo oculto
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados Generales del Formulario
  const [tipoSeleccionado, setTipoSeleccionado] = useState('Gasto');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [monto, setMonto] = useState('');
  const [entidad, setEntidad] = useState('');
  const [detalle, setDetalle] = useState('');
  
  const [formaPago, setFormaPago] = useState('Tarjeta de Crédito');
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState('En un pago');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Otros');
  
  const [pagoAutomatico, setPagoAutomatico] = useState(false);
  const [cargoFijo, setCargoFijo] = useState(false);
  
  // Estados de Menús Desplegables
  const [isCategoriaOpen, setIsCategoriaOpen] = useState(false);
  const [isFormaPagoOpen, setIsFormaPagoOpen] = useState(false);
  const [isCuotasOpen, setIsCuotasOpen] = useState(false);
  
  // Estado de carga y error
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false); 
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [userId, setUserId] = useState('');

  // Diccionarios Inversos (Base de Datos a Español)
  const uiTipoMap: Record<string, string> = { 'EXPENSE': 'Gasto', 'INCOME': 'Ingreso', 'SAVING': 'Ahorro', 'INVESTMENT': 'Inversión' };
  const uiCategoriaMap: Record<string, string> = { 'INCOME': 'Ingreso', 'HEALTH': 'Salud', 'UTILITIES': 'Servicios', 'FOOD': 'Alimentos', 'TRANSPORT': 'Transporte', 'AUTO': 'Autos', 'APPS': 'Suscripciones', 'ENTERTAINMENT': 'Entretenimiento', 'EDUCATION': 'Estudios', 'OTHER': 'Otros' };
  const uiPagoMap: Record<string, string> = { 'CREDIT_CARD': 'Tarjeta de Crédito', 'DEBIT_CARD': 'Tarjeta de Débito', 'CASH': 'Efectivo', 'TRANSFER': 'Transferencia' };

  useEffect(() => {
    const cargarDatosEdicion = async () => {
      const usuarioActivo = localStorage.getItem('usuario_eledger');
      if (!usuarioActivo) return;
      
      const datosUsuario = JSON.parse(usuarioActivo);
      setUserId(datosUsuario.id);

      if (editId) {
        setIsLoadingData(true);
        try {
          const timestamp = new Date().getTime();
          const response = await fetch(`/api/transactions?userId=${datosUsuario.id}&t=${timestamp}`, {
            cache: 'no-store' 
          });
          
          const data = await response.json();
          const txEdit = data.find((t: any) => String(t.id) === String(editId));
          
          if (txEdit) {
            setTipoSeleccionado(uiTipoMap[txEdit.type] || 'Gasto');
            const fechaSegura = new Date(txEdit.date).toISOString().split('T')[0];
            setFecha(fechaSegura);
            setMonto(txEdit.amount.toString());
            setEntidad(txEdit.entity);
            setDetalle(txEdit.detail || '');
            setCategoriaSeleccionada(uiCategoriaMap[txEdit.category] || 'Otros');
            setFormaPago(uiPagoMap[txEdit.paymentMethod] || 'Efectivo');
            
            if (txEdit.installments && txEdit.installments > 1) {
              setCuotaSeleccionada(`${txEdit.installments} cuotas`);
            } else {
              setCuotaSeleccionada('En un pago');
            }
            
            setPagoAutomatico(txEdit.isAutomatic || false);
            setCargoFijo(txEdit.isFixed || false);
          }
        } catch (error) {
          console.error("Error buscando el gasto:", error);
        } finally {
          setIsLoadingData(false);
        }
      }
    };

    cargarDatosEdicion();
  }, [editId]);

  const opcionesCategoria = ['Salud', 'Servicios', 'Alimentos', 'Transporte', 'Autos', 'Suscripciones', 'Entretenimiento', 'Estudios', 'Otros'];
  const opcionesPago = ['Tarjeta de Crédito', 'Tarjeta de Débito', 'Efectivo', 'Transferencia', 'Inversión'];
  const opcionesCuotas = ['En un pago', '2 cuotas', '3 cuotas', '6 cuotas', '12 cuotas'];

  const isTarjeta = formaPago === 'Tarjeta de Crédito' || formaPago === 'Tarjeta de Débito';
  const isTarjetaCredito = formaPago === 'Tarjeta de Crédito';

  const handleFormaPagoChange = (opcion: string) => {
    setFormaPago(opcion);
    setIsFormaPagoOpen(false);
    if (opcion !== 'Tarjeta de Crédito') {
      setCuotaSeleccionada('En un pago');
      setPagoAutomatico(false);
      setCargoFijo(false);
    }
  };

  const handleGuardarRegistro = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    
    if (!monto || parseFloat(monto) <= 0) {
      setErrorMsg('Por favor, ingresa un monto válido mayor a 0.');
      return;
    }
    if (!entidad.trim()) {
      setErrorMsg('Por favor, ingresa el lugar o la entidad.');
      return;
    }

    setIsSubmitting(true);

    const tipoMap: Record<string, string> = { 'Gasto': 'EXPENSE', 'Ingreso': 'INCOME', 'Ahorro': 'SAVING', 'Inversión': 'INVESTMENT' };
    const categoriaMap: Record<string, string> = { 'Ingreso': 'INCOME', 'Salud': 'HEALTH', 'Servicios': 'UTILITIES', 'Alimentos': 'FOOD', 'Transporte': 'TRANSPORT', 'Autos': 'AUTO', 'Suscripciones': 'APPS', 'Entretenimiento': 'ENTERTAINMENT', 'Estudios': 'EDUCATION', 'Otros': 'OTHER' };
    const pagoMap: Record<string, string> = { 'Tarjeta de Crédito': 'CREDIT_CARD', 'Tarjeta de Débito': 'DEBIT_CARD', 'Efectivo': 'CASH', 'Transferencia': 'TRANSFER', 'Inversión': 'TRANSFER' };

    const payload = {
      id: editId || undefined, 
      userId: userId,
      amount: parseFloat(monto),
      date: fecha,
      entity: entidad,
      detail: detalle || null,
      type: tipoMap[tipoSeleccionado],
      category: categoriaMap[categoriaSeleccionada],
      paymentMethod: pagoMap[formaPago],
      installments: cuotaSeleccionada === 'En un pago' ? 1 : parseInt(cuotaSeleccionada.split(' ')[0]),
      isFixed: cargoFijo,
      isAutomatic: pagoAutomatico
    };

    try {
      const method = editId ? 'PUT' : 'POST';
      
      const response = await fetch('/api/transactions', {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccessMsg(editId ? '¡Movimiento actualizado exitosamente!' : '¡Movimiento guardado exitosamente!');
        setTimeout(() => { router.push('/gastos'); }, 1500);
      } else {
        const errorData = await response.json();
        setErrorMsg(errorData.error || 'Error al guardar el movimiento.');
      }
    } catch (error) {
      setErrorMsg('Error de conexión con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportarExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const bstr = event.target?.result;
          const workbook = XLSX.read(bstr, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          const data = XLSX.utils.sheet_to_json(worksheet);
          let importadosExito = 0;

          const tipoMapInv: Record<string, string> = { 'Gasto': 'EXPENSE', 'Ingreso': 'INCOME', 'Ahorro': 'SAVING', 'Inversión': 'INVESTMENT' };
          const catMapInv: Record<string, string> = { 'Salud': 'HEALTH', 'Servicios': 'UTILITIES', 'Alimentos': 'FOOD', 'Transporte': 'TRANSPORT', 'Autos': 'AUTO', 'Suscripciones': 'APPS', 'Entretenimiento': 'ENTERTAINMENT', 'Estudios': 'EDUCATION', 'Otros': 'OTHER' };
          const pagoMapInv: Record<string, string> = { 'Tarjeta de Crédito': 'CREDIT_CARD', 'Tarjeta de Débito': 'DEBIT_CARD', 'Efectivo': 'CASH', 'Transferencia': 'TRANSFER' };

          for (const row of data as any[]) {
            let fechaFormat = new Date().toISOString().split('T')[0];
            if (row.Fecha && typeof row.Fecha === 'string') {
              const parts = row.Fecha.split('/');
              if (parts.length === 3) fechaFormat = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }

            const payload = {
              userId: userId,
              amount: Math.abs(parseFloat(row.Monto || 0)),
              date: fechaFormat,
              entity: row.Entidad || 'Importado',
              detail: row.Detalle || null,
              type: tipoMapInv[row.Tipo] || 'EXPENSE',
              category: catMapInv[row.Categoría || row.Categoria] || 'OTHER',
              paymentMethod: pagoMapInv[row['Forma de Pago']] || 'CASH',
              installments: 1,
              isFixed: false,
              isAutomatic: false
            };

            const res = await fetch('/api/transactions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

            if (res.ok) importadosExito++;
          }

          setSuccessMsg(`¡Se importaron ${importadosExito} movimientos exitosamente!`);
          setTimeout(() => { router.push('/gastos'); }, 2000);

        } catch (err) {
          setErrorMsg('Error al leer el formato del Excel. Asegúrate de usar la plantilla correcta.');
        } finally {
          setIsImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      
      reader.readAsBinaryString(file);
      
    } catch (error) {
      setErrorMsg('Error al procesar el archivo.');
      setIsImporting(false);
    }
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen md:p-8 bg-white md:bg-brand-bg relative">
        
        {isLoadingData && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <svg className="animate-spin h-10 w-10 text-brand-dark mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <p className="font-semibold text-brand-dark">Cargando datos del movimiento...</p>
          </div>
        )}

        <div className="max-w-3xl mx-auto">
          <div className="hidden md:block text-center mb-10">
            <h1 className="text-3xl font-bold text-brand-dark">
              {editId ? 'Editar Movimiento' : 'Registrar Movimiento'}
            </h1>
            <p className="text-gray-500 mt-2">
              {editId ? 'Modifica los detalles de tu transacción y guarda los cambios.' : 'Ingresa los detalles de tu nueva transacción.'}
            </p>
          </div>

          <div className="bg-white md:p-8 md:rounded-xl md:border border-gray-200 md:shadow-sm">
            <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-100 mb-6 sticky top-0 bg-white z-10">
              <Link href="/gastos" className="p-2 text-brand-dark hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </Link>
              <h1 className="text-xl font-bold text-brand-dark absolute left-1/2 -translate-x-1/2">
                {editId ? 'Editar' : 'Registrar'}
              </h1>
              <div className="w-10"></div>
            </div>

            <div className="px-5 md:px-0">
              
              <div className="mb-8">
                <label className="block text-sm font-semibold text-brand-dark mb-3">Tipo de movimiento</label>
                
                <div className="md:hidden flex bg-slate-100 p-1 rounded-xl w-full">
                  <button onClick={() => setTipoSeleccionado('Gasto')} className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg transition-all ${tipoSeleccionado === 'Gasto' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'}`}>
                    <span className={`text-[10px] sm:text-xs font-semibold ${tipoSeleccionado === 'Gasto' ? 'text-brand-dark' : 'text-slate-500'}`}>Gasto</span>
                  </button>
                  <button onClick={() => setTipoSeleccionado('Ingreso')} className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg transition-all ${tipoSeleccionado === 'Ingreso' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'}`}>
                    <span className={`text-[10px] sm:text-xs font-semibold ${tipoSeleccionado === 'Ingreso' ? 'text-brand-dark' : 'text-slate-500'}`}>Ingreso</span>
                  </button>
                  <button onClick={() => setTipoSeleccionado('Ahorro')} className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg transition-all ${tipoSeleccionado === 'Ahorro' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'}`}>
                    <span className={`text-[10px] sm:text-xs font-semibold ${tipoSeleccionado === 'Ahorro' ? 'text-brand-dark' : 'text-slate-500'}`}>Ahorro</span>
                  </button>
                  <button onClick={() => setTipoSeleccionado('Inversión')} className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg transition-all ${tipoSeleccionado === 'Inversión' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'}`}>
                    <span className={`text-[10px] sm:text-xs font-semibold ${tipoSeleccionado === 'Inversión' ? 'text-brand-dark' : 'text-slate-500'}`}>Inversión</span>
                  </button>
                </div>

                <div className="hidden md:grid grid-cols-2 gap-4">
                  <button onClick={() => setTipoSeleccionado('Gasto')} className={`flex items-center justify-center gap-2 py-3 px-4 rounded-md border-2 font-semibold transition-all ${tipoSeleccionado === 'Gasto' ? 'border-red-400 bg-red-50 text-red-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>Gasto
                  </button>
                  <button onClick={() => setTipoSeleccionado('Ingreso')} className={`flex items-center justify-center gap-2 py-3 px-4 rounded-md border-2 font-semibold transition-all ${tipoSeleccionado === 'Ingreso' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>Ingreso
                  </button>
                  <button onClick={() => setTipoSeleccionado('Ahorro')} className={`flex items-center justify-center gap-2 py-3 px-4 rounded-md border-2 font-semibold transition-all ${tipoSeleccionado === 'Ahorro' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2" strokeWidth={2} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h2" /></svg>Ahorro
                  </button>
                  <button onClick={() => setTipoSeleccionado('Inversión')} className={`flex items-center justify-center gap-2 py-3 px-4 rounded-md border-2 font-semibold transition-all ${tipoSeleccionado === 'Inversión' ? 'border-amber-600 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 17l6-6 4 4 8-8" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7h4v4" /></svg>Inversión
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-brand-dark">Fecha</label>
                  <input 
                    type="date" 
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full border border-gray-300 rounded-md py-2.5 px-3 text-sm text-gray-700 focus:outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark" 
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-brand-dark">Monto</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500 font-medium">$</span>
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      value={monto}
                      onChange={(e) => setMonto(e.target.value)}
                      className="w-full border border-gray-300 rounded-md py-2.5 pl-8 pr-3 text-sm text-gray-700 focus:outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark" 
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-sm font-semibold text-brand-dark">Lugar o Entidad</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Supermercado, Salario, Netflix..." 
                    value={entidad}
                    onChange={(e) => setEntidad(e.target.value)}
                    className="w-full border border-gray-300 rounded-md py-2.5 px-3 text-sm text-gray-700 focus:outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark" 
                  />
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-sm font-semibold text-brand-dark">Detalle <span className="text-gray-400 font-normal">(Opcional)</span></label>
                  <textarea 
                    placeholder="Añade una nota..." 
                    rows={3} 
                    value={detalle}
                    onChange={(e) => setDetalle(e.target.value)}
                    className="w-full border border-gray-300 rounded-md py-2.5 px-3 text-sm text-gray-700 focus:outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark resize-none"
                  ></textarea>
                </div>

                <div className="flex flex-col gap-2 relative md:col-span-2">
                  <label className="text-sm font-semibold text-brand-dark">Categoría</label>
                  {isCategoriaOpen && <div className="fixed inset-0 z-10" onClick={() => setIsCategoriaOpen(false)}></div>}
                  <div 
                    className="relative z-20 w-full border border-gray-300 rounded-md py-2.5 px-3 text-sm text-gray-700 bg-white cursor-pointer flex justify-between items-center hover:border-gray-400"
                    onClick={() => setIsCategoriaOpen(!isCategoriaOpen)}
                  >
                    <span>{categoriaSeleccionada}</span>
                    <svg className={`w-4 h-4 text-gray-500 transition-transform ${isCategoriaOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                  {isCategoriaOpen && (
                    <div className="absolute top-[72px] left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg z-30 overflow-hidden max-h-48 overflow-y-auto">
                      {opcionesCategoria.map((opcion) => (
                        <div 
                          key={opcion} 
                          className={`py-2.5 px-3 text-sm cursor-pointer hover:bg-brand-light transition-colors ${categoriaSeleccionada === opcion ? 'bg-gray-50 font-semibold text-brand-dark' : 'text-gray-700'}`}
                          onClick={() => { setCategoriaSeleccionada(opcion); setIsCategoriaOpen(false); }}
                        >
                          {opcion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 relative">
                  <label className="text-sm font-semibold text-brand-dark">Forma de Pago</label>
                  {isFormaPagoOpen && <div className="fixed inset-0 z-10" onClick={() => setIsFormaPagoOpen(false)}></div>}
                  <div 
                    className="relative z-20 w-full border border-gray-300 rounded-md py-2.5 px-3 text-sm text-gray-700 bg-white cursor-pointer flex justify-between items-center hover:border-gray-400"
                    onClick={() => setIsFormaPagoOpen(!isFormaPagoOpen)}
                  >
                    <span>{formaPago}</span>
                    <svg className={`w-4 h-4 text-gray-500 transition-transform ${isFormaPagoOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                  {isFormaPagoOpen && (
                    <div className="absolute top-[72px] left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg z-30 overflow-hidden">
                      {opcionesPago.map((opcion) => (
                        <div 
                          key={opcion} 
                          className={`py-2.5 px-3 text-sm cursor-pointer hover:bg-brand-light transition-colors ${formaPago === opcion ? 'bg-gray-50 font-semibold text-brand-dark' : 'text-gray-700'}`}
                          onClick={() => handleFormaPagoChange(opcion)}
                        >
                          {opcion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 relative">
                  <label className={`text-sm font-semibold transition-colors ${!isTarjetaCredito ? 'text-gray-400' : 'text-brand-dark'}`}>Cuotas</label>
                  {isCuotasOpen && <div className="fixed inset-0 z-10" onClick={() => setIsCuotasOpen(false)}></div>}
                  <div 
                    className={`relative z-20 w-full border rounded-md py-2.5 px-3 text-sm flex justify-between items-center transition-colors ${!isTarjetaCredito ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border-gray-300 text-gray-700 cursor-pointer hover:border-gray-400'}`}
                    onClick={() => isTarjetaCredito && setIsCuotasOpen(!isCuotasOpen)}
                  >
                    <span>{cuotaSeleccionada}</span>
                    <svg className={`w-4 h-4 transition-transform ${isCuotasOpen ? 'rotate-180' : ''} ${!isTarjetaCredito ? 'text-gray-300' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                  {isCuotasOpen && (
                    <div className="absolute top-[72px] left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg z-30 overflow-hidden">
                      {opcionesCuotas.map((opcion) => (
                        <div 
                          key={opcion} 
                          className={`py-2.5 px-3 text-sm cursor-pointer hover:bg-brand-light transition-colors ${cuotaSeleccionada === opcion ? 'bg-gray-50 font-semibold text-brand-dark' : 'text-gray-700'}`}
                          onClick={() => { setCuotaSeleccionada(opcion); setIsCuotasOpen(false); }}
                        >
                          {opcion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className={`mt-8 bg-gray-50 border border-gray-100 p-5 rounded-lg flex flex-col gap-5 transition-opacity duration-300 ${!isTarjeta ? 'opacity-40 pointer-events-none' : ''}`}>
                <div className="flex items-center justify-between cursor-pointer group" onClick={() => setPagoAutomatico(!pagoAutomatico)}>
                  <span className="text-sm font-medium text-brand-dark select-none">Pago Automático</span>
                  <button type="button" className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none ${pagoAutomatico ? 'bg-brand-dark' : 'bg-gray-300 group-hover:bg-gray-400'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ease-in-out ${pagoAutomatico ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between cursor-pointer group" onClick={() => setCargoFijo(!cargoFijo)}>
                  <span className="text-sm font-medium text-brand-dark select-none">Cargo Fijo (Mensual)</span>
                  <button type="button" className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none ${cargoFijo ? 'bg-brand-dark' : 'bg-gray-300 group-hover:bg-gray-400'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ease-in-out ${cargoFijo ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              {errorMsg && <div className="mt-6 p-3 bg-red-50 text-red-600 rounded-md text-sm text-center border border-red-100 font-semibold">{errorMsg}</div>}
              {successMsg && <div className="mt-6 p-3 bg-green-50 text-green-600 rounded-md text-sm text-center border border-green-100 font-semibold">{successMsg}</div>}

              {/* BOTÓN PRIMARIO: GUARDAR REGISTRO */}
              <div className="mt-8">
                <button 
                  onClick={handleGuardarRegistro}
                  disabled={isSubmitting || isImporting}
                  className="w-full bg-brand-dark text-white py-3.5 rounded-md font-semibold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Guardando...
                    </span>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                      {editId ? 'Guardar Cambios' : 'Guardar Registro'}
                    </>
                  )}
                </button>
              </div>

              {/* LÍNEA DIVISORIA */}
              {!editId && (
                <>
                  <div className="mt-6 flex items-center gap-4">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">O importa tu historial</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>

                  {/* BOTÓN SECUNDARIO: IMPORTAR EXCEL */}
                  <div className="mt-6 pb-8 md:pb-0">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImportarExcel} 
                      accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                      className="hidden" 
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isImporting || isSubmitting}
                      className="w-full bg-green-50 text-green-700 border border-green-200 py-3.5 rounded-md font-semibold hover:bg-green-100 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isImporting ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-green-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Procesando planilla...
                        </span>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                          Importar desde Excel
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}

export default function RegistrarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="font-semibold text-brand-dark">Cargando...</p>
      </div>
    }>
      <RegistrarFormContent />
    </Suspense>
  );
}