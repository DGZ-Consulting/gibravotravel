-- CreateTable
CREATE TABLE "auditoria_cambios_estado_pago" (
    "id" TEXT NOT NULL,
    "tipoVenta" TEXT NOT NULL,
    "registroId" TEXT NOT NULL,
    "nombreCliente" TEXT NOT NULL,
    "estadoAnterior" TEXT NOT NULL,
    "estadoNuevo" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "usuarioNombre" TEXT,
    "usuarioEmail" TEXT,
    "fechaCambio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "auditoria_cambios_estado_pago_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_auditoria_pago_tipo_venta" ON "auditoria_cambios_estado_pago"("tipoVenta");
CREATE INDEX "idx_auditoria_pago_registro_id" ON "auditoria_cambios_estado_pago"("registroId");
CREATE INDEX "idx_auditoria_pago_usuario_id" ON "auditoria_cambios_estado_pago"("usuarioId");
CREATE INDEX "idx_auditoria_pago_fecha" ON "auditoria_cambios_estado_pago"("fechaCambio");
