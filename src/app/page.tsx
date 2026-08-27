'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [accesoPermitido, setAccesoPermitido] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [saldoTotal, setSaldoTotal] = useState(0);
  const [ingresosMes, setIngresosMes] = useState(0);
  const [egresosMes, setEgresosMes] = useState(0);
  const [inversiones, setInversiones] = useState(0);
  
  const [distribucion, setDistribucion] = useState<{categoria: string, porcentaje: number, monto: number, color: string}[]>([]);
  const [proximosVencimientos, setProximosVencimientos] = useState<any[]>([]);

  const coloresCategoria: Record<string, string> = {
    'Salud': 'bg-rose-500', 'Servicios': 'bg-blue-500', 'Alimentos': 'bg-amber-500',
    'Transporte': 'bg-teal-500', 'Autos': 'bg-slate-500', 'Suscripciones': 'bg-purple-500',
    'Entretenimiento': 'bg-pink-500', 'Estudios': 'bg-indigo-500', 'Otros': 'bg-gray-500'
  };
  
  const categoriaUiMap: Record<string, string> = {
    'HEALTH': 'Salud', 'UTILITIES': 'Servicios', 'FOOD': 'Alimentos', 'TRANSPORT': 'Transporte',
    'AUTO': 'Autos', 'APPS': 'Suscripciones', 'ENTERTAINMENT': 'Entretenimiento', 'EDUCATION': 'Estudios', 'OTHER': 'Otros'
  };

  useEffect(() => {
    const usuarioActivo = localStorage.getItem('usuario_eledger');
    
    if (!usuarioActivo) {
      router.push('/auth');
      return;
    } 

    const datosUsuario = JSON.parse(usuarioActivo);
    setNombreUsuario(datosUsuario.name.split(' ')[0]);
    setAccesoPermitido(true);

    const fetchDatos = async () => {
      try {
        const response = await fetch(`/api/transactions?userId=${datosUsuario.id}`);
        if (response.ok) {
          const txs = await response.json();
          calcularMetricas(txs);
        }
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDatos();
  }, [router]);

  const calcularMetricas = (txs: any[]) => {
    const ahora = new Date();
    // Normalizamos la fecha de hoy a las 00:00 para hacer cálculos matemáticos limpios
    const hoyLocal = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    
    const mesActual = ahora.getMonth();
    const añoActual = ahora.getFullYear();

    let totalIngresosHist = 0;
    let totalSalidasHist = 0;
    let ingMes = 0;
    let egrMes = 0;
    let invTotal = 0;

    const gastosCat: Record<string, number> = {};
    
    // Diccionario temporal para guardar el último pago de cada servicio
    const vencimientosMap = new Map();
    // 1. REGLA DE CATEGORÍAS (Servicios, Apps, Autos)
    const categoriasVencimiento = ['UTILITIES', 'APPS', 'AUTO'];

    txs.forEach(tx => {
      const [year, month, day] = tx.date.split('T')[0].split('-');
      const fechaTxLocal = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      const esEsteMes = parseInt(month) - 1 === mesActual && parseInt(year) === añoActual;
      const monto = parseFloat(tx.amount);

      if (tx.type === 'INCOME') {
        totalIngresosHist += monto;
        if (esEsteMes) ingMes += monto;
      } else if (tx.type === 'EXPENSE') {
        totalSalidasHist += monto;
        if (esEsteMes) {
          egrMes += monto;
          const catEspañol = categoriaUiMap[tx.category] || 'Otros';
          gastosCat[catEspañol] = (gastosCat[catEspañol] || 0) + monto;
        }
        
        // MOTOR DE VENCIMIENTOS INTELIGENTE
        if (categoriasVencimiento.includes(tx.category) || tx.isFixed) {
          const entityUpper = tx.entity.toUpperCase();
          // Solo guardamos el pago más reciente de esa entidad (ej: el último Prime Video)
          if (!vencimientosMap.has(entityUpper) || fechaTxLocal > vencimientosMap.get(entityUpper).fechaUltimoPago) {
            vencimientosMap.set(entityUpper, {
              ...tx,
              fechaUltimoPago: fechaTxLocal
            });
          }
        }

      } else if (tx.type === 'INVESTMENT') {
        totalSalidasHist += monto; 
        invTotal += monto;
      } else if (tx.type === 'SAVING') {
        totalSalidasHist += monto; 
      }
    });

    const futuros: any[] = [];
    
    // 2. REGLA PREDICTIVA (+1 MES)
    vencimientosMap.forEach((data) => {
      let proximaFecha = new Date(data.fechaUltimoPago);
      
      // Si el registro es de hoy o del pasado, su vencimiento real es el mes que viene
      if (proximaFecha <= hoyLocal) {
        proximaFecha.setMonth(proximaFecha.getMonth() + 1);
      }
      
      futuros.push({
        entity: data.entity,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        isAutomatic: data.isAutomatic,
        proximaFecha: proximaFecha
      });
    });

    // Ordenamos para que los que vencen más rápido aparezcan primero
    futuros.sort((a, b) => a.proximaFecha.getTime() - b.proximaFecha.getTime());
    setProximosVencimientos(futuros.slice(0, 4));

    setSaldoTotal(totalIngresosHist - totalSalidasHist);
    setIngresosMes(ingMes);
    setEgresosMes(egrMes);
    setInversiones(invTotal);

    if (egrMes > 0) {
      const distribucionArr = Object.keys(gastosCat).map(cat => ({
        categoria: cat,
        monto: gastosCat[cat],
        porcentaje: Math.round((gastosCat[cat] / egrMes) * 100),
        color: coloresCategoria[cat] || 'bg-gray-500'
      })).sort((a, b) => b.porcentaje - a.porcentaje);
      setDistribucion(distribucionArr);
    } else {
      setDistribucion([]);
    }
  };

  // Función para calcular los días que faltan (con Escudo Anti-Errores)
  const getDiasFaltantes = (fechaObj: Date) => {
    // ESCUDO: Si por algún motivo la fecha no llega, devolvemos un texto en vez de explotar
    if (!fechaObj) return 'Calculando...'; 

    const ahora = new Date();
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    
    const diffTime = fechaObj.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Vence hoy';
    if (diffDays === 1) return 'Vence mañana';
    return `Vence en ${diffDays} días`;
  };

  if (!accesoPermitido) return null; 

  const formatearDinero = (monto: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(monto);
  };

  return (
    <main className="p-4 md:p-8 max-w-[1400px] mx-auto min-h-screen">
      
      <div className="mb-8 mt-2 flex justify-between items-end">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-brand-dark">Hola, {nombreUsuario}</h1>
          <p className="text-gray-500 mt-1 md:mt-2">Aquí está el resumen de tu mes actual</p>
        </div>
        {isLoading && (
          <div className="text-sm text-gray-400 font-semibold flex items-center gap-2 animate-pulse">
            <svg className="animate-spin h-4 w-4 text-brand-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Sincronizando...
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="bg-brand-dark text-white p-6 rounded-xl shadow-md flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="flex justify-between items-start mb-6">
            <span className="text-sm font-semibold text-gray-200 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              Saldo para Gastar
            </span>
            <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </div>
          </div>
          <div>
            <h3 className="text-3xl lg:text-4xl font-bold mb-2">{formatearDinero(saldoTotal)}</h3>
            <p className="text-xs text-gray-300 font-medium">Líquido disponible (resta ahorros e inversiones)</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:border-green-200 transition-colors">
          <div className="flex justify-between items-start mb-6">
            <span className="text-sm font-bold text-gray-700">Ingresos Mensuales</span>
            <div className="p-1.5 bg-green-50 rounded-full">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-brand-dark mb-4">{formatearDinero(ingresosMes)}</h3>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: ingresosMes > 0 ? '100%' : '0%' }}></div>
            </div>
            <p className="text-xs text-gray-400 font-medium">Ingresos generados este mes</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:border-red-200 transition-colors">
          <div className="flex justify-between items-start mb-6">
            <span className="text-sm font-bold text-gray-700">Egresos Mensuales</span>
            <div className="p-1.5 bg-red-50 rounded-full">
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-brand-dark mb-4">{formatearDinero(egresosMes)}</h3>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
              <div className="bg-red-500 h-1.5 rounded-full" style={{ width: egresosMes > 0 ? (egresosMes > ingresosMes ? '100%' : `${(egresosMes/ingresosMes)*100}%`) : '0%' }}></div>
            </div>
            <p className="text-xs text-gray-400 font-medium">
              {ingresosMes > 0 ? `Representa el ${Math.round((egresosMes/ingresosMes)*100)}% de tus ingresos` : 'Gastos acumulados este mes'}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:border-amber-200 transition-colors">
          <div className="flex justify-between items-start mb-6">
            <span className="text-sm font-bold text-gray-700 flex flex-col">
              Capital Trabajando
              <span className="text-xs text-gray-400 font-normal mt-0.5">(Inversiones)</span>
            </span>
            <div className="p-1.5 bg-amber-50 rounded-full">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-brand-dark mb-3">{formatearDinero(inversiones)}</h3>
            <p className="text-xs text-gray-500 mb-1 font-medium"><span className="text-gray-400 font-bold">Total Invertido</span></p>
            <p className="text-xs text-gray-400 font-medium">Dinero fuera de tu cuenta corriente</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-brand-dark flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Próximos Vencimientos
            </h3>
            <Link href="/gastos" className="text-sm font-semibold text-brand-dark hover:underline">Gestionar</Link>
          </div>
          
          <div className="flex-1 flex flex-col">
            {proximosVencimientos.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50 border border-dashed border-gray-200 rounded-xl mt-2">
                <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h4 className="font-bold text-gray-700">Todo al día</h4>
                <p className="text-sm text-gray-500 mt-1">No tienes gastos registrados para los próximos días.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {proximosVencimientos.map((mov, i) => {
                  const diasFaltantes = getDiasFaltantes(mov.proximaFecha);
                  const esUrgente = diasFaltantes.includes('hoy') || diasFaltantes.includes('mañana');
                  
                  // 3. REGLA DEL MÉTODO DE PAGO (Débito/Crédito = Automático)
                  const esAutomatico = mov.isAutomatic || mov.paymentMethod === 'CREDIT_CARD' || mov.paymentMethod === 'DEBIT_CARD';
                  
                  return (
                    <div key={i} className={`flex items-center justify-between p-4 bg-white border ${esUrgente ? 'border-red-100 bg-red-50/30' : 'border-gray-100'} rounded-xl shadow-sm hover:border-gray-200 transition-colors`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${esUrgente ? 'bg-red-100 text-red-500' : 'bg-slate-100 text-brand-dark'}`}>
                          {mov.entity.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-brand-dark text-sm">{mov.entity}</h4>
                          <p className={`text-xs font-medium flex items-center gap-1 mt-0.5 ${esUrgente ? 'text-red-500' : 'text-gray-500'}`}>
                            {esUrgente && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                            {diasFaltantes}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-brand-dark block">{formatearDinero(mov.amount)}</span>
                        <span className="text-[10px] text-gray-400 font-medium uppercase">
                          {esAutomatico ? 'Débito Automático' : 'A pagar'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="font-bold text-brand-dark flex items-center gap-2 mb-6">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
            Distribución de Gastos
          </h3>
          
          <div className="flex-1 flex flex-col justify-center">
            {distribucion.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-4">
                 <div className="w-24 h-24 rounded-full border-4 border-gray-100 border-dashed flex items-center justify-center mb-4">
                    <span className="text-gray-300 font-medium text-sm">0%</span>
                 </div>
                 <p className="text-sm text-gray-500">Aún no hay gastos este mes.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 w-full">
                {distribucion.map((item, index) => (
                  <div key={index} className="w-full">
                    <div className="flex justify-between text-sm font-semibold mb-1">
                      <span className="text-brand-dark">{item.categoria}</span>
                      <span className="text-gray-500">{item.porcentaje}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.porcentaje}%` }}></div>
                    </div>
                  </div>
                ))}
                <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                  <p className="text-xs text-gray-500">Tus mayores gastos se concentran en <span className="font-bold text-brand-dark">{distribucion[0].categoria}</span>.</p>
                </div>
              </div>
            )}
          </div>
          
          <Link href="/registrar" className="mt-6 block w-full text-center bg-brand-light text-brand-dark py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors">
            Registrar Movimiento
          </Link>
        </div>

      </div>
    </main>
  );
}