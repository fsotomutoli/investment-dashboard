import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import styles from "./ResumenView.module.css";
import { Investment, Snapshot } from "../types";
import { MetricCard } from "./MetricCard";
import { InvestmentCard } from "./InvestmentCard";
import { formatCLP, formatPct, formatDate, FILTERS, FilterLabel, filterByMonths } from "../utils";

interface ByTipo {
  tipo: string;
  color: string;
  total: number;
}

interface ResumenViewProps {
  investments: Investment[];
  history: Snapshot[];
  totalActual: number;
  totalAporte: number;
  gananciaTotal: number;
  pctTotal: number;
  byTipo: ByTipo[];
  barMax: number;
  onCardClick: (inv: Investment) => void;
}

export function ResumenView({
  investments, history, totalActual, totalAporte, gananciaTotal, pctTotal, byTipo, barMax, onCardClick,
}: ResumenViewProps) {
  const [filter, setFilter] = useState<FilterLabel>("6M");
  const months = FILTERS.find(f => f.label === filter)!.months;
  const trendData = filterByMonths([...history].reverse(), months);
  return (
    <div className={styles.view}>
      <div className={styles.metricsRow}>
        <MetricCard
          label="Valor total"
          value={formatCLP(totalActual)}
          sub={`Base ${formatCLP(totalAporte)}`}
        />
        <MetricCard
          label="Ganancia"
          value={formatCLP(gananciaTotal)}
          positive={gananciaTotal >= 0}
          negative={gananciaTotal < 0}
        />
        <MetricCard
          label="Rentabilidad"
          value={formatPct(pctTotal)}
          positive={pctTotal >= 0}
          negative={pctTotal < 0}
        />
      </div>

      <div className={styles.distributionBar}>
        {investments.map(inv => (
          <div
            key={inv.id}
            className={styles.distributionSegment}
            style={{
              width: `${totalActual > 0 ? (inv.valorActual / totalActual) * 100 : 0}%`,
              background: inv.color,
            }}
          />
        ))}
      </div>

      {byTipo.length > 0 && (
        <div className={styles.distribution}>
          {/* Izquierda: donut + leyenda */}
          <div className={styles.leftPanel}>
            <div className={styles.donutWrap}>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={byTipo}
                    dataKey="total"
                    nameKey="tipo"
                    innerRadius={50}
                    outerRadius={72}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {byTipo.map(t => (
                      <Cell key={t.tipo} fill={t.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#12121A", border: "1px solid #1E1E2E", borderRadius: 8, fontSize: 12, color: "#E8E6E1" }}
                    formatter={val => [typeof val === "number" ? formatCLP(val) : ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className={styles.legend}>
              {byTipo.map(t => (
                <div key={t.tipo} className={styles.legendRow}>
                  <span className={styles.legendDot} style={{ background: t.color }} />
                  <span className={styles.legendNombre}>{t.tipo}</span>
                  <span className={styles.legendTotal}>{formatCLP(t.total)}</span>
                  <span className={styles.legendPct}>
                    {(totalActual > 0 ? (t.total / totalActual) * 100 : 0).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Derecha: línea inversión vs balance */}
          <div className={styles.rightPanel}>
            <div className={styles.chartHeader}>
              <p className={styles.chartLabel}>Inversión vs Balance</p>
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
            {trendData.length >= 2 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" vertical={false} />
                  <XAxis
                    dataKey="fecha"
                    tickFormatter={formatDate}
                    tick={{ fill: "#555", fontSize: 9, fontFamily: "DM Mono, monospace" }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tickFormatter={n => "$" + (n / 1_000_000).toFixed(1) + "M"}
                    tick={{ fill: "#555", fontSize: 9, fontFamily: "DM Mono, monospace" }}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                  />
                  <Tooltip
                    contentStyle={{ background: "#12121A", border: "1px solid #1E1E2E", borderRadius: 8, fontSize: 11, color: "#E8E6E1" }}
                    formatter={(val, name) => [typeof val === "number" ? formatCLP(val) : "", name === "totalActual" ? "Balance" : "Inversión"]}
                    labelFormatter={label => formatDate(String(label))}
                  />
                  <Line type="monotone" dataKey="totalActual" stroke="#4ECDC4" strokeWidth={2} dot={false} name="totalActual" />
                  <Line type="monotone" dataKey="totalAporte" stroke="#444" strokeWidth={1.5} dot={false} strokeDasharray="4 4" name="totalAporte" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.chartEmpty}>
                <p>Actualiza balances para ver la tendencia</p>
              </div>
            )}
          </div>
        </div>
      )}

      <p className={styles.sectionLabel}>Inversiones</p>
      <div className={styles.investGrid}>
        {investments.map(inv => (
          <InvestmentCard
            key={inv.id}
            mode="resumen"
            investment={inv}
            barMax={barMax}
            onClick={() => onCardClick(inv)}
          />
        ))}
      </div>

      <p className={styles.hint}>Haz clic en una inversión para actualizar su valor</p>
    </div>
  );
}
