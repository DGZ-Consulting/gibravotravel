import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (!user || !['ADMIN', 'TI'].includes(user.role)) {
      return NextResponse.json(
        { error: 'No tienes permisos para ver la auditoría' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const tipoVenta = searchParams.get('tipoVenta');
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const where: { tipoVenta?: string } = {};
    if (tipoVenta) {
      where.tipoVenta = tipoVenta;
    }

    const [registros, total] = await Promise.all([
      prisma.auditoriaCambioEstadoPago.findMany({
        where,
        orderBy: { fechaCambio: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.auditoriaCambioEstadoPago.count({ where }),
    ]);

    return NextResponse.json({
      registros,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching auditoría cambio estado pago:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
