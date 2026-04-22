/**
 * Riga TOTALI tabella Biglietteria: solo numeri → es. 65.526,20 €
 * (migliaia con punto, decimali con virgola, € in coda)
 */
export function formatEuroTotaleBiglietteria(n: number): string {
  if (typeof n !== "number" || Number.isNaN(n)) return "-";
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  const [intRaw, frac = "00"] = abs.toFixed(2).split(".");
  const intPart = intRaw.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${sign}${intPart},${frac} €`;
}
