'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (path: string) => pathname === path;

  // Estado para saber si el usuario está logueado
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const usuarioActivo = localStorage.getItem('usuario_eledger');
    setIsLoggedIn(!!usuarioActivo);
  }, [pathname]);

  // Función para cerrar sesión desde el celular
  const handleLogout = () => {
    localStorage.removeItem('usuario_eledger');
    setIsLoggedIn(false);
    router.push('/auth');
  };

  // Si no está logueado, directamente no dibujamos la barra inferior
  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 px-4 py-2 pb-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center relative h-12">
        
        {/* 1. Botón Resumen */}
        <Link href="/" className="flex flex-col items-center gap-1 w-14">
          <div className={`p-1.5 rounded-full transition-colors ${isActive('/') ? 'bg-brand-dark text-white' : 'text-gray-400 hover:text-brand-dark'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          </div>
          <span className={`text-[10px] ${isActive('/') ? 'font-bold text-brand-dark' : 'font-medium text-gray-400'}`}>Resumen</span>
        </Link>

        {/* 2. Botón Mis Gastos */}
        <Link href="/gastos" className="flex flex-col items-center gap-1 w-14">
          <div className={`p-1.5 rounded-full transition-colors ${isActive('/gastos') ? 'bg-brand-dark text-white' : 'text-gray-400 hover:text-brand-dark'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <span className={`text-[10px] ${isActive('/gastos') ? 'font-bold text-brand-dark' : 'font-medium text-gray-400'}`}>Gastos</span>
        </Link>

        {/* 3. ESPACIADOR (Acá flota el botón central, dejamos el hueco para que no se pisen) */}
        <div className="w-14"></div>
        
        {/* Botón Central: Registrar (Flotante) */}
        <Link href="/registrar" className="absolute left-1/2 -translate-x-1/2 -top-6 flex flex-col items-center">
          <div className={`text-white rounded-full p-4 shadow-lg border-4 border-white transition-transform ${isActive('/registrar') ? 'bg-blue-600 scale-105' : 'bg-brand-dark hover:scale-105'}`}>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          </div>
          <span className={`text-[10px] mt-1 ${isActive('/registrar') ? 'font-bold text-blue-600' : 'font-semibold text-brand-dark'}`}>Registrar</span>
        </Link>

        {/* 4. Botón Mi Biblioteca */}
        <Link href="/biblioteca" className="flex flex-col items-center gap-1 w-14">
          <div className={`p-1.5 rounded-full transition-colors ${isActive('/biblioteca') ? 'bg-brand-dark text-white' : 'text-gray-400 hover:text-brand-dark'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477-4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <span className={`text-[10px] ${isActive('/biblioteca') ? 'font-bold text-brand-dark' : 'font-medium text-gray-400'}`}>Biblioteca</span>
        </Link>
        
        {/* 5. Botón Dinámico: Salir o Cuenta */}
        {isLoggedIn ? (
          <button onClick={handleLogout} className="flex flex-col items-center gap-1 w-14 group">
            <div className="p-1.5 rounded-full transition-colors text-red-500 group-hover:bg-red-50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </div>
            <span className="text-[10px] font-medium text-red-500">Salir</span>
          </button>
        ) : (
          <Link href="/auth?mode=login" className="flex flex-col items-center gap-1 w-14">
            <div className={`p-1.5 rounded-full transition-colors ${pathname.includes('/auth') ? 'bg-brand-dark text-white' : 'text-gray-400 hover:text-brand-dark'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <span className={`text-[10px] ${pathname.includes('/auth') ? 'font-bold text-brand-dark' : 'font-medium text-gray-400'}`}>Cuenta</span>
          </Link>
        )}

      </div>
    </div>
  );
}