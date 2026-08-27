import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma'; // Ajustá los puntos si es necesario según tu estructura

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, passwordHash } = body;

    if (!email || !passwordHash) {
      return NextResponse.json(
        { error: 'Correo y contraseña obligatorios' }, 
        { status: 400 }
      );
    }

    // Buscamos al usuario en la base de datos por su email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Verificamos si existe y si la contraseña coincide
    if (!user || user.passwordHash !== passwordHash) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' }, 
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: '¡Inicio de sesión exitoso!', user }, 
      { status: 200 }
    );

  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json(
      { error: 'Error en el servidor' }, 
      { status: 500 }
    );
  }
}