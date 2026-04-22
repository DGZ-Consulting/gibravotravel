import type { ReactNode } from "react";

/**
 * Evita que la shell de /biglietteria quede cacheada en CDN/proxy con JS viejo
 * (la página es "use client" pero el segmento padre puede forzarse dinámico).
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function BiglietteriaLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
