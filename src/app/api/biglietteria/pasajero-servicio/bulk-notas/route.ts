import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

interface BulkNotasRequestBody {
  ids?: string[];
  notas?: string | null;
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (!user || !['TI', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'No tienes permisos para actualizar notas en lote' },
        { status: 403 }
      );
    }

    const body = (await request.json()) as BulkNotasRequestBody;
    const rawIds = Array.isArray(body.ids) ? body.ids : [];
    const ids = Array.from(
      new Set(rawIds.map((id) => (typeof id === 'string' ? id.trim() : '')).filter(Boolean))
    );

    if (ids.length === 0) {
      return NextResponse.json({ error: 'Debes enviar al menos un registro válido' }, { status: 400 });
    }

    if (ids.length > 500) {
      return NextResponse.json({ error: 'Máximo 500 registros por operación' }, { status: 400 });
    }

    const notasValue =
      typeof body.notas === 'string' ? body.notas : body.notas === null ? '' : '';

    const result = await prisma.pasajeroServicioBiglietteria.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        notas: notasValue,
      },
    });

    return NextResponse.json({
      updated: result.count,
      requested: ids.length,
    });
  } catch (error) {
    console.error('Error bulk updating notas:', error);
    return NextResponse.json(
      {
        error: 'Error al actualizar las notas en lote',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
