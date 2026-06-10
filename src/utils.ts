export function formatCLP(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CL");
}

export function formatPct(n: number): string {
  return (n >= 0 ? "+" : "") + n.toFixed(1) + "%";
}

export function formatDate(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
}

export function calcPct(valorActual: number, aporte: number): number {
  return aporte > 0 ? ((valorActual - aporte) / aporte) * 100 : 0;
}

export type FilterLabel = "2M" | "4M" | "6M" | "1A" | "2A";

export const FILTERS: { label: FilterLabel; months: number }[] = [
  { label: "2M", months: 2 },
  { label: "4M", months: 4 },
  { label: "6M", months: 6 },
  { label: "1A", months: 12 },
  { label: "2A", months: 24 },
];

export function filterByMonths<T extends { fecha: string }>(items: T[], months: number): T[] {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  return items.filter(s => new Date(s.fecha) >= cutoff);
}
