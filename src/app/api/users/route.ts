import { NextResponse } from 'next/server';
// Importamos la instancia de Prisma que configuraste en tu carpeta lib
import { prisma } from '../../../lib/prisma'; 

export async function POST(request: Request) {
  try {
    // 1. Extraemos los datos que nos envía el frontend
    const body = await request.json();
    const { email, name, passwordHash } = body;

    // 2. Validación básica para asegurarnos de que no nos manden datos vacíos
    if (!email || !name || !passwordHash) {
      return NextResponse.json(
        { error: 'El email, nombre y contraseña son obligatorios' }, 
        { status: 400 }
      );
    }

    // 3. Le pedimos a Prisma que cree el usuario en la tabla de Supabase
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
      },
    });

    // 4. Respondemos con éxito y devolvemos los datos del usuario creado
    return NextResponse.json(
      { message: 'Usuario creado exitosamente', user: newUser }, 
      { status: 201 }
    );

  } catch (error) {
    console.error("Error al crear usuario:", error);
    return NextResponse.json(
      { error: 'Hubo un problema al crear el usuario en la base de datos' }, 
      { status: 500 }
    );
  }
}