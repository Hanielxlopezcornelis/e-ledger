'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [accesoPermitido, setAccesoPermitido] = useState(false);

  useEffect(() => {
    const usuarioActivo = localStorage.getItem('usuario_eledger');
    
    if (!usuarioActivo) {
      router.push('/auth');
    } else {
      setAccesoPermitido(true);
    }
  }, [router]);

  // Si no tiene la llave, devolvemos null para que no haya parpadeos de la interfaz
  if (!accesoPermitido) {
    return null;
  }

  // Si tiene la llave, mostramos la página que está pidiendo
  return <>{children}</>;
}