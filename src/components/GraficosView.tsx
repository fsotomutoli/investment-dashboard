import { useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import styles from "./GraficosView.module.css";
import { Snapshot } from "../types";
import { MetricCard } from "./MetricCard";
import { formatCLP, formatPct, formatDate, calcPct } from "../utils";

type FilterLabel = "2M" | "4M" | "6M" | "1A" | "2A";

const FILTERS: { label: FilterLabel; months: number }[] = [
  { label: "2M", months: 2 },
  { label: "4M", months: 4 },
  { label: "6M", months: 6 },
  { label: "1A", months: 12 },
  { label: "2A", months: 24 },
];

function filterByMonths(history: Snapshot[], months: number): Snapshot[] {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  return [...history].reverse().filter(s => new Date(s.fecha) >= cutoff);
}

interface GraficosViewProps {
  history: Snapshot[];
}

export function GraficosView({ history }: GraficosViewProps) {
  const [filter, setFilter] = useState<FilterLabel>("6M");
  const months = FILTERS.find(f => f.label === filter)!.months;
  const chartData = filterByMonths(history, months);
  const hasChart = chartData.length >= 2;

  const first = chartData[0];
  const last = chartData[chartData.length - 1];
  const maxSnap = hasChart ? chartData.reduce((m, s) => s.totalActual > m.totalActual ? s : m, first) : null;
  const minSnap = hasChart ? chartData.reduce((m, s) => s.totalActual < m.totalActual ? s : m, first) : null;
  const variacion = hasChart ? last.totalActual - first.totalActual : 0;
  const variacionPct = hasChart ? calcPct(last.totalActual, first.totalActual) : 0;
  const oldestDate = history.length > 0 ? history[history.length - 1].fecha : null;

  return (
    <div className={styles.view}>
      <div className={styles.header}>
        <p className={styles.sectionLabel}>Evolución del portafolio</p>
        <div className={styles.filters}>
          {FILTERS.map(f => (
            <button
              key={f.label}
              className={`${styles.filterBtn} ${filter === f.label ? styles.filterActive : ""}`}
              onClick={() => setFilter(f.label)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {history.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>Aún no hay datos.</p>
          <p className={styles.emptySub}>Actualiza el valor de una inversión para generar el primer snapshot.</p>
        </div>
      ) : !hasChart ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>No hay datos suficientes para este período.</p>
          {oldestDate && (
            <p className={styles.emptySub}>El dato más antiguo es del {formatDate(oldestDate)}.</p>
          )}
        </div>
      ) : (
        <>
          <div className={styles.chartCard}>
            <div className={styles.chartLegend}>
              <span className={styles.legendItem}>
                <span className={styles.legendLine} style={{ background: "#4ECDC4" }} />
                Valor actual
              </span>
              <span className={styles.legendItem}>
                <span className={styles.legendLineDashed} />
                Base invertida
              </span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" vertical={false} />
                <XAxis
                  dataKey="fecha"
                  tickFormatter={formatDate}
                  tick={{ fill: "#555", fontSize: 10, fontFamily: "DM Mono, monospace" }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickFormatter={n => "$" + (n / 1_000_000).toFixed(1) + "M"}
                  tick={{ fill: "#555", fontSize: 10, fontFamily: "DM Mono, monospace" }}
                  axisLine={false}
                  tickLine={false}
                  width={52}
                />
                <Tooltip
                  contentStyle={{ background: "#12121A", border: "1px solid #1E1E2E", borderRadius: 8, fontSize: 12, color: "#E8E6E1" }}
                  formatter={(val, name) => [typeof val === "number" ? formatCLP(val) : "", name === "totalActual" ? "Valor" : "Base"]}
                  labelFormatter={label => formatDate(String(label))}
                />
                <Line type="monotone" dataKey="totalActual" stroke="#4ECDC4" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="totalAporte" stroke="#444" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.statsRow}>
            <MetricCard
              label="Variación en el período"
              value={`${variacion >= 0 ? "+" : ""}${formatCLP(variacion)}`}
              sub={formatPct(variacionPct)}
              positive={variacion >= 0}
              negative={variacion < 0}
            />
            <MetricCard
              label="Máximo en el período"
              value={formatCLP(maxSnap!.totalActual)}
              sub={formatDate(maxSnap!.fecha)}
            />
            <MetricCard
              label="Mínimo en el período"
              value={formatCLP(minSnap!.totalActual)}
              sub={formatDate(minSnap!.fecha)}
            />
          </div>
        </>
      )}
    </div>
  );
}
