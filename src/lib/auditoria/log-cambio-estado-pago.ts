import type { NextRequest } from 'next/server';
import type { PrismaClient, Prisma } from '@prisma/client';

export type TipoVentaEstadoPago = 'biglietteria' | 'tour_aereo' | 'tour_bus';

export async function logCambioEstadoPago(
  db: PrismaClient | Prisma.TransactionClient,
  request: NextRequest,
  clerkUserId: string,
  data: {
    tipoVenta: TipoVentaEstadoPago;
    registroId: string;
    nombreCliente: string;
    estadoAnterior: string;
    estadoNuevo: string;
  }
): Promise<void> {
  const prev = (data.estadoAnterior ?? '').trim();
  const next = (data.estadoNuevo ?? '').trim();
  if (prev === next) return;

  const user = await db.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { firstName: true, lastName: true, email: true },
  });

  const forwarded = request.headers.get('x-forwarded-for');
  const ipAddress =
    forwarded?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    null;
  const userAgent = request.headers.get('user-agent') || null;

  try {
    await db.auditoriaCambioEstadoPago.create({
      data: {
        tipoVenta: data.tipoVenta,
        registroId: data.registroId,
        nombreCliente: data.nombreCliente,
        estadoAnterior: prev,
        estadoNuevo: next,
        usuarioId: clerkUserId,
        usuarioNombre: user
          ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || null
          : null,
        usuarioEmail: user?.email ?? null,
        ipAddress,
        userAgent,
      },
    });
  } catch (err) {
    console.warn('No se pudo registrar auditoría cambio estado pago:', err);
  }
}
