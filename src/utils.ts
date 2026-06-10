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
