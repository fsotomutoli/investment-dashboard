import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import styles from "./HistorialView.module.css";
import { Snapshot } from "../types";
import { formatCLP, formatPct, formatDate } from "../utils";

interface HistorialViewProps {
  history: Snapshot[];
}

export function HistorialView({ history }: HistorialViewProps) {
  const chartData = [...history].reverse();

  return (
    <div className={styles.view}>
      <p className={styles.sectionLabel}>Historial de snapshots</p>

      {history.length >= 2 && (
        <div className={styles.chartCard}>
          <p className={styles.chartTitle}>Rendimiento en el tiempo</p>
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
          <ResponsiveContainer width="100%" height={200}>
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
      )}

      {history.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>Aún no hay snapshots.</p>
          <p className={styles.emptySub}>Se registran automáticamente al actualizar un valor o aporte.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {history.map(snap => (
            <div key={snap.fecha} className={styles.row}>
              <div>
                <p className={styles.rowDate}>{formatDate(snap.fecha)}</p>
                <p className={styles.rowTotal}>{formatCLP(snap.totalActual)}</p>
                <p className={styles.rowAporte}>base {formatCLP(snap.totalAporte)}</p>
              </div>
              <div>
                <p className={`${styles.rowPct} ${snap.pct >= 0 ? styles.positive : styles.negative}`}>
                  {formatPct(snap.pct)}
                </p>
                <p className={styles.rowGanancia}>
                  {snap.ganancia >= 0 ? "+" : ""}{formatCLP(snap.ganancia)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
