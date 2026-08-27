'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthForm() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const router = useRouter();
  
  const [isLogin, setIsLogin] = useState(mode !== 'register');

  // Estados para Registro
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    passwordHash: '',
  });
  const [status, setStatus] = useState('');

  // Estados para Login
  const [loginData, setLoginData] = useState({ email: '', passwordHash: '' });
  const [loginStatus, setLoginStatus] = useState('');
  
  // Estado para evitar el "fantasma" del login
  const [revisandoSesion, setRevisandoSesion] = useState(true);

  // GUARDIA DE SEGURIDAD: Controla si ya estás logueado
  useEffect(() => {
    const usuarioActivo = localStorage.getItem('usuario_eledger');
    if (usuarioActivo) {
      router.push('/');
    } else {
      setRevisandoSesion(false); // Solo mostramos el formulario si NO hay usuario
    }
  }, [router]);

  useEffect(() => {
    setIsLogin(mode !== 'register');
  }, [mode]);

  // Función de Registro
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Enviando...');

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('¡Cuenta creada con éxito! Ya podés iniciar sesión.');
        setFormData({ name: '', email: '', passwordHash: '' });
      } else {
        setStatus('Hubo un error al crear la cuenta.');
      }
    } catch (error) {
      console.error(error);
      setStatus('Error de conexión.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginStatus('Verificando...');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('usuario_eledger', JSON.stringify(data.user)); 
        
        setLoginStatus('¡Ingreso exitoso! Redirigiendo...');
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } else {
        setLoginStatus('Correo o contraseña incorrectos.');
      }
    } catch (error) {
      console.error(error);
      setLoginStatus('Error de conexión.');
    }
  };

  // OCULTAMOS EL FORMULARIO MIENTRAS PIENSA
  if (revisandoSesion) {
    return null; 
  }

  return (
    <div className="w-full max-w-4xl">
      
      {/* =========================================================================
          VERSIÓN MÓVIL: ANIMACIÓN 3D DE CARTA GIRATORIA
          ========================================================================= */}
      <div className="md:hidden relative w-full h-[580px] [perspective:1000px]">
        <div 
          className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${
            isLogin ? '' : '[transform:rotateY(180deg)]'
          }`}
        >
          
          {/* LADO FRENTE MÓVIL: Iniciar Sesión */}
          <form onSubmit={handleLogin} className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-white rounded-2xl shadow-xl p-8 flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-brand-dark mb-6">Iniciar Sesión</h2>
            <input type="email" placeholder="Correo" value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} required className="w-full mb-4 p-3 border border-gray-200 rounded-md bg-gray-50 text-black focus:outline-none focus:border-brand-dark" />
            <input type="password" placeholder="Contraseña" value={loginData.passwordHash} onChange={(e) => setLoginData({ ...loginData, passwordHash: e.target.value })} required className="w-full mb-6 p-3 border border-gray-200 rounded-md bg-gray-50 text-black focus:outline-none focus:border-brand-dark" />
            <button type="submit" className="w-full bg-brand-dark text-white py-3 rounded-md font-semibold hover:bg-opacity-90 transition-colors">Entrar</button>
            
            {loginStatus && <p className="mt-3 text-center text-sm font-bold text-brand-dark">{loginStatus}</p>}

            <p className="mt-6 text-center text-sm text-gray-600">
              ¿No tenés cuenta?<br/>
              <button onClick={() => setIsLogin(false)} type="button" className="mt-2 text-brand-dark font-bold hover:underline px-4 py-2 border border-brand-dark rounded-full">
                Registrate
              </button>
            </p>
          </form>

          {/* LADO ATRÁS MÓVIL: Registrarse */}
          <form onSubmit={handleRegister} className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-brand-dark text-white rounded-2xl shadow-xl p-8 flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-6">Crear Cuenta</h2>
            <input type="text" placeholder="Nombre completo" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full mb-4 p-3 bg-white rounded-md text-brand-dark focus:outline-none" />
            <input type="email" placeholder="Correo" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="w-full mb-4 p-3 bg-white rounded-md text-brand-dark focus:outline-none" />
            <input type="password" placeholder="Contraseña" value={formData.passwordHash} onChange={(e) => setFormData({ ...formData, passwordHash: e.target.value })} required className="w-full mb-6 p-3 bg-white rounded-md text-brand-dark focus:outline-none" />
            <button type="submit" className="w-full bg-white text-brand-dark py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors">Registrarse</button>
            
            {status && <p className="mt-3 text-center text-sm font-bold text-green-400">{status}</p>}

            <p className="mt-6 text-center text-sm text-gray-300">
              ¿Ya tenés cuenta?<br/>
              <button onClick={() => setIsLogin(true)} type="button" className="mt-2 text-white font-bold hover:underline px-4 py-2 border border-white rounded-full">
                Volver al Login
              </button>
            </p>
          </form>

        </div>
      </div>

      {/* =========================================================================
          VERSIÓN ESCRITORIO: PANEL DESLIZANTE
          ========================================================================= */}
      <div className="hidden md:flex relative w-full bg-white rounded-2xl shadow-xl overflow-hidden flex-row h-[500px]">
        
        {/* Formulario Login PC (Izquierda) */}
        <form onSubmit={handleLogin} className="w-1/2 p-12 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-brand-dark mb-6">Iniciar Sesión</h2>
          <input type="email" placeholder="Correo" value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} required className="w-full mb-4 p-3 border border-gray-200 rounded-md bg-gray-50 text-black focus:outline-none focus:border-brand-dark" />
          <input type="password" placeholder="Contraseña" value={loginData.passwordHash} onChange={(e) => setLoginData({ ...loginData, passwordHash: e.target.value })} required className="w-full mb-6 p-3 border border-gray-200 rounded-md bg-gray-50 text-black focus:outline-none focus:border-brand-dark" />
          <button type="submit" className="w-full bg-brand-dark text-white py-3 rounded-md font-semibold hover:bg-opacity-90 transition-colors">Entrar</button>

          {loginStatus && <p className="mt-4 text-center font-bold text-brand-dark">{loginStatus}</p>}
        </form>

        {/* Formulario Registro PC (Derecha) */}
        <form onSubmit={handleRegister} className="w-1/2 p-12 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-brand-dark mb-6">Crear Cuenta</h2>
          <input type="text" placeholder="Nombre completo" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full mb-4 p-3 border border-gray-200 rounded-md bg-gray-50 text-black focus:outline-none focus:border-brand-dark" />
          <input type="email" placeholder="Correo" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="w-full mb-4 p-3 border border-gray-200 rounded-md bg-gray-50 text-black focus:outline-none focus:border-brand-dark" />
          <input type="password" placeholder="Contraseña" value={formData.passwordHash} onChange={(e) => setFormData({ ...formData, passwordHash: e.target.value })} required className="w-full mb-6 p-3 border border-gray-200 rounded-md bg-gray-50 text-black focus:outline-none focus:border-brand-dark" />
          <button type="submit" className="w-full bg-brand-dark text-white py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors">Registrarse</button>

          {status && <p className="mt-4 text-center font-bold text-green-600">{status}</p>}
        </form>

        {/* Panel Animado PC */}
        <div 
          className={`absolute top-0 left-0 h-full w-1/2 bg-brand-dark text-white transition-transform duration-700 ease-in-out flex flex-col items-center justify-center p-12 text-center shadow-2xl z-20 ${
            isLogin ? 'translate-x-full' : 'translate-x-0'
          }`}
        >
          <h2 className="text-3xl font-bold mb-4">
            {isLogin ? '¡Hola de nuevo!' : '¡Bienvenido!'}
          </h2>
          <p className="mb-8 text-gray-200">
            {isLogin 
              ? 'Registrate para llevar el control total de tus finanzas y no perder ningún detalle.' 
              : 'Si ya tenés una cuenta, iniciá sesión para ver tu resumen actual.'}
          </p>
          <button 
            onClick={() => setIsLogin(!isLogin)}
            type="button"
            className="border-2 border-white px-8 py-2 rounded-full font-semibold hover:bg-white hover:text-brand-dark transition-colors"
          >
            {isLogin ? 'Registrarse' : 'Iniciar Sesión'}
          </button>
        </div>
      </div>

    </div>
  );
}

export default function AuthPage() {
  return (
    <main className="p-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-140px)]">
      <Suspense fallback={<div className="font-semibold text-brand-dark">Cargando...</div>}>
        <AuthForm />
      </Suspense>
    </main>
  );
}