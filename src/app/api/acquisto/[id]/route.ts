import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user || !['TI', 'ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'No tienes permisos' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { acquisto } = body;

    if (!acquisto || acquisto.trim() === '') {
      return NextResponse.json(
        { error: 'El campo Acquisto es obligatorio' },
        { status: 400 }
      );
    }

    const existente = await prisma.acquisto.findUnique({
      where: { id },
    });

    if (!existente) {
      return NextResponse.json({ error: 'Acquisto no encontrado' }, { status: 404 });
    }

    const duplicado = await prisma.acquisto.findFirst({
      where: {
        acquisto: acquisto.trim(),
        id: { not: id },
      },
    });

    if (duplicado) {
      return NextResponse.json(
        { error: 'Este Acquisto ya existe' },
        { status: 400 }
      );
    }

    const actualizado = await prisma.acquisto.update({
      where: { id },
      data: { acquisto: acquisto.trim() },
    });

    return NextResponse.json({
      acquisto: actualizado,
      message: 'Acquisto actualizado exitosamente',
    });
  } catch (error) {
    console.error('Error updating acquisto:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user || !['TI', 'ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'No tienes permisos' }, { status: 403 });
    }

    const { id } = await params;

    const existente = await prisma.acquisto.findUnique({
      where: { id },
    });

    if (!existente) {
      return NextResponse.json({ error: 'Acquisto no encontrado' }, { status: 404 });
    }

    await prisma.acquisto.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: 'Acquisto eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting acquisto:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
