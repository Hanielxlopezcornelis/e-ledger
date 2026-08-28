'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('usuario_eledger');
    router.push('/auth');
  };

  const navLinks = [
    { name: 'Resumen', href: '/' },
    { name: 'Registrar', href: '/registrar' },
    { name: 'Mis Gastos', href: '/gastos' },
    { name: 'Mi Biblioteca', href: '/biblioteca' },
  ];

  const isAuthPage = pathname === '/auth';

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo visible siempre */}
          <Link href={isAuthPage ? "/auth" : "/"} className="flex items-center">
            <div className="w-6 h-6 bg-brand-dark text-white rounded flex items-center justify-center font-bold text-[10px]">E</div>
            <span className="text-brand-dark font-bold text-xl tracking-tight">-Ledger</span>
          </Link>

          {/* Menú y botón de salida solo si NO estamos en /auth */}
          {!isAuthPage && (
            <>
              <div className="hidden md:flex items-center space-x-8">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`text-sm font-semibold transition-colors py-2 relative group ${
                        isActive ? 'text-brand-dark' : 'text-gray-500 hover:text-brand-dark'
                      }`}
                    >
                      {link.name}
                      <span className={`absolute bottom-0 left-0 h-0.5 bg-brand-dark transition-all duration-300 ${
                        isActive ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}></span>
                    </Link>
                  );
                })}
              </div>

              <div className="hidden md:flex">
                <button
                  onClick={handleLogout}
                  className="text-red-500 border border-red-200 bg-red-50 px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-red-100 transition-colors"
                >
                  Cerrar Sesión
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </nav>
  );
}