import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma'; // ¡Acá estaba el error! Son 3 niveles para atrás, no 4.

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Extraemos todos los datos que nos va a mandar tu formulario
    const {
      userId,
      amount,
      date,
      entity,
      detail,
      type,
      category,
      paymentMethod,
      installments,
      isFixed,
      isAutomatic
    } = body;

    // Validación básica: nos aseguramos de que lleguen los datos clave
    if (!userId || !amount || !date || !entity || !type || !paymentMethod) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' }, 
        { status: 400 }
      );
    }

    // Le decimos a Prisma que cree el registro en la base de datos
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        amount: parseFloat(amount), 
        date: new Date(date),       
        entity,
        detail: detail || null,
        type,
        category: category || 'OTHER', 
        paymentMethod,
        installments: installments ? parseInt(installments) : null,
        isFixed: isFixed || false,
        isAutomatic: isAutomatic || false,
      }
    });

    return NextResponse.json(
      { message: '¡Movimiento guardado con éxito!', transaction }, 
      { status: 201 }
    );

  } catch (error) {
    console.error("Error guardando el movimiento:", error);
    return NextResponse.json(
      { error: 'Error interno del servidor al guardar' }, 
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Obtenemos la URL para sacar el ID del usuario que está pidiendo sus datos
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Falta el ID del usuario' }, 
        { status: 400 }
      );
    }

    // Le pedimos a Prisma que traiga TODOS los movimientos de ESTE usuario
    // y los ordene por fecha (los más nuevos primero)
    const transactions = await prisma.transaction.findMany({
      where: { 
        userId: userId 
      },
      orderBy: { 
        date: 'desc' 
      }
    });

    return NextResponse.json(transactions, { status: 200 });

  } catch (error) {
    console.error("Error obteniendo los movimientos:", error);
    return NextResponse.json(
      { error: 'Error interno del servidor al obtener datos' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Falta el ID del movimiento' }, { status: 400 });
    }

    // Le decimos a Prisma que borre el registro con ese ID exacto
    await prisma.transaction.delete({
      where: { id: id }
    });

    return NextResponse.json({ message: 'Movimiento eliminado correctamente' }, { status: 200 });

  } catch (error) {
    console.error("Error al eliminar:", error);
    return NextResponse.json({ error: 'Error interno del servidor al eliminar' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    // Necesitamos el ID para saber cuál editar, más los datos nuevos
    const {
      id, amount, date, entity, detail, type, category, paymentMethod, installments, isFixed, isAutomatic
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Falta el ID del movimiento a editar' }, { status: 400 });
    }

    // Le decimos a Prisma que actualice ESE registro específico
    const transaction = await prisma.transaction.update({
      where: { id: id },
      data: {
        amount: parseFloat(amount),
        date: new Date(date),
        entity,
        detail: detail || null,
        type,
        category: category || 'OTHER',
        paymentMethod,
        installments: installments ? parseInt(installments) : null,
        isFixed: isFixed || false,
        isAutomatic: isAutomatic || false,
      }
    });

    return NextResponse.json({ message: '¡Movimiento actualizado con éxito!', transaction }, { status: 200 });

  } catch (error) {
    console.error("Error al actualizar el movimiento:", error);
    return NextResponse.json({ error: 'Error interno del servidor al actualizar' }, { status: 500 });
  }
}