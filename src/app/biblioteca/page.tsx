'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProtectedRoute from "../../components/layout/ProtectedRoute";

const mesesDelAño = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function BibliotecaPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [historial, setHistorial] = useState<any>({});
  
  const añoActual = new Date().getFullYear();

  useEffect(() => {
    const usuarioActivo = localStorage.getItem('usuario_eledger');
    if (!usuarioActivo) {
      router.push('/auth');
      return;
    }
    
    const datosUsuario = JSON.parse(usuarioActivo);

    const fetchDatos = async () => {
      try {
        const response = await fetch(`/api/transactions?userId=${datosUsuario.id}`);
        if (response.ok) {
          const txs = await response.json();
          procesarHistorial(txs);
        }
      } catch (error) {
        console.error("Error cargando biblioteca:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDatos();
  }, [router]);

  const procesarHistorial = (txs: any[]) => {
    const agrupado: any = {};

    txs.forEach(tx => {
      const [yearStr, monthStr] = tx.date.split('T')[0].split('-');
      const year = parseInt(yearStr);
      const mesNombre = mesesDelAño[parseInt(monthStr) - 1];
      
      const monto = parseFloat(tx.amount);

      if (!agrupado[year]) {
        agrupado[year] = {};
      }
      
      if (!agrupado[year][mesNombre]) {
        agrupado[year][mesNombre] = {
          ingresos: 0,
          egresos: 0,
          transacciones: [] 
        };
      }

      if (tx.type === 'INCOME') {
        agrupado[year][mesNombre].ingresos += monto;
      } else {
        agrupado[year][mesNombre].egresos += monto;
      }
      
      agrupado[year][mesNombre].transacciones.push(tx);
    });

    setHistorial(agrupado);
  };

  // Diccionarios de traducción para el Excel
  const tipoUiMap: Record<string, string> = { 'EXPENSE': 'Gasto', 'INCOME': 'Ingreso', 'SAVING': 'Ahorro', 'INVESTMENT': 'Inversión' };
  const categoriaUiMap: Record<string, string> = { 'HEALTH': 'Salud', 'UTILITIES': 'Servicios', 'FOOD': 'Alimentos', 'TRANSPORT': 'Transporte', 'AUTO': 'Autos', 'APPS': 'Suscripciones', 'ENTERTAINMENT': 'Entretenimiento', 'EDUCATION': 'Estudios', 'OTHER': 'Otros', 'INCOME': 'Ingreso' };
  const pagoUiMap: Record<string, string> = { 'CREDIT_CARD': 'Tarjeta de Crédito', 'DEBIT_CARD': 'Tarjeta de Débito', 'CASH': 'Efectivo', 'TRANSFER': 'Transferencia' };

  // FUNCIÓN PARA DESCARGAR CSV (Traducida y con formato contable)
  const descargarMes = (mes: string, año: string, transacciones: any[]) => {
    let csvContent = "Fecha;Entidad;Detalle;Categoría;Forma de Pago;Tipo;Monto\n";
    
    transacciones.forEach(tx => {
      // 1. Forzamos la fecha a formato DD/MM/YYYY
      const [year, month, day] = tx.date.split('T')[0].split('-');
      const fechaFormat = `${day}/${month}/${year}`;
      
      const detalleLimpio = tx.detail ? tx.detail.replace(/;/g, ' ').replace(/\n/g, ' ') : ''; 
      const entidadLimpia = tx.entity.replace(/;/g, ' ');
      
      // 2. Traducimos los valores crudos al español
      const categoriaEspanol = categoriaUiMap[tx.category] || tx.category;
      const pagoEspanol = pagoUiMap[tx.paymentMethod] || tx.paymentMethod;
      const tipoEspanol = tipoUiMap[tx.type] || tx.type;
      
      // 3. Formato contable: Si es gasto, va con signo negativo para que Excel lo reste automático
      const montoNum = tx.type === 'EXPENSE' ? -Math.abs(tx.amount) : Math.abs(tx.amount);
      
      const fila = `${fechaFormat};${entidadLimpia};${detalleLimpio};${categoriaEspanol};${pagoEspanol};${tipoEspanol};${montoNum}`;
      csvContent += fila + "\n";
    });

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Reporte_ELedger_${mes}_${año}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatearDinero = (monto: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(monto);
  };

  const añosOrdenados = Object.keys(historial).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <ProtectedRoute>
      <main className="min-h-screen p-4 md:p-8 max-w-[1200px] mx-auto">
        
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-brand-dark">Mi Biblioteca</h1>
          <p className="text-gray-500 mt-2">Tu archivo histórico de movimientos y reportes mensuales.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-gray-500 font-semibold gap-2">
            <svg className="animate-spin h-6 w-6 text-brand-dark" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Ordenando tus archivos...
          </div>
        ) : añosOrdenados.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-gray-100 text-center shadow-sm">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            <h3 className="text-xl font-bold text-brand-dark">Tu biblioteca está vacía</h3>
            <p className="text-gray-500 mt-2">Los reportes mensuales aparecerán aquí automáticamente.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {añosOrdenados.map((añoStr) => {
              const añoNum = parseInt(añoStr);
              const mesesDelAñoDatos = historial[añoStr];
              
              const mesesOrdenados = Object.keys(mesesDelAñoDatos).sort((a, b) => mesesDelAño.indexOf(b) - mesesDelAño.indexOf(a));

              return (
                <section key={añoStr} className="relative">
                  
                  {/* Etiqueta del Año (MODIFICADA) */}
                  <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-2xl font-bold text-brand-dark">{añoStr}</h2>
                    <div className="flex-1 h-px bg-gray-200"></div>
                    {añoNum === añoActual && (
                      <span className="bg-brand-dark text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Año Actual
                      </span>
                    )}
                  </div>

                  {/* Grilla de Tarjetas Mensuales */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mesesOrdenados.map(mes => {
                      const dataMes = mesesDelAñoDatos[mes];
                      const balance = dataMes.ingresos - dataMes.egresos;
                      
                      return (
                        <div key={mes} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                          
                          <div className="bg-slate-50 px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-brand-dark">{mes}</h3>
                            <span className="text-xs font-semibold text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-200">
                              {dataMes.transacciones.length} movs.
                            </span>
                          </div>

                          <div className="p-5 flex-1 flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-semibold text-gray-500 flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                Ingresos
                              </span>
                              <span className="font-bold text-green-600">{formatearDinero(dataMes.ingresos)}</span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-semibold text-gray-500 flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                                Egresos
                              </span>
                              <span className="font-bold text-brand-dark">{formatearDinero(dataMes.egresos)}</span>
                            </div>

                            <div className="w-full h-px bg-gray-100 my-1"></div>

                            <div className="flex justify-between items-center">
                              <span className="text-sm font-bold text-gray-700">Balance</span>
                              <span className={`font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {balance >= 0 ? '+' : ''}{formatearDinero(balance)}
                              </span>
                            </div>
                          </div>

                          <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                            <button 
                              onClick={() => descargarMes(mes, añoStr, dataMes.transacciones)}
                              className="flex-1 flex justify-center items-center gap-1.5 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                              title="Descargar Excel (CSV)"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                              Excel
                            </button>
                            
                            <Link 
                              href={`/gastos?año=${añoStr}&mes=${mes}`}
                              className="flex-1 flex justify-center items-center gap-1.5 py-2 bg-brand-light text-brand-dark text-sm font-semibold rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              Ver Detalle
                            </Link>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}

      </main>
    </ProtectedRoute>
  );
}