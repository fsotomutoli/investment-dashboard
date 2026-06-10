import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import styles from "./ResumenView.module.css";
import { Investment, Snapshot } from "../types";
import { MetricCard } from "./MetricCard";
import { InvestmentCard } from "./InvestmentCard";
import { formatCLP, formatPct, formatDate, FILTERS, FilterLabel, filterByMonths } from "../utils";

const DONUT_MAX = 6;
const OTROS_COLOR = "#4A4A5A";

interface ByTipo {
  tipo: string;
  color: string;
  total: number;
}

function withOtros(data: ByTipo[]): ByTipo[] {
  if (data.length <= DONUT_MAX) return data;
  const sorted = [...data].sort((a, b) => b.total - a.total);
  const top = sorted.slice(0, DONUT_MAX);
  const otrosTotal = sorted.slice(DONUT_MAX).reduce((s, t) => s + t.total, 0);
  return [...top, { tipo: "Otros", color: OTROS_COLOR, total: otrosTotal }];
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
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [donutMode, setDonutMode] = useState<"tipo" | "inversion">("tipo");
  const [showBalance, setShowBalance] = useState(true);
  const [showBase, setShowBase] = useState(true);
  const [selectedInvIds, setSelectedInvIds] = useState<Set<number>>(new Set());

  const months = FILTERS.find(f => f.label === filter)!.months;
  const trendData = filterByMonths([...history].reverse(), months);

  const rawDonutData = donutMode === "tipo"
    ? byTipo
    : investments.map(inv => ({ tipo: inv.name, color: inv.color, total: inv.valorActual }));
  const donutData = withOtros(rawDonutData);

  // Investments that have data in at least one snapshot of the current period
  const availableInvs = investments.filter(inv =>
    trendData.some(snap => snap.investments.some(si => si.id === inv.id))
  );

  // Build chart data: each point has totals + per-investment values keyed by id
  const chartData = trendData.map(snap => {
    const point: Record<string, unknown> = {
      fecha: snap.fecha,
      totalActual: snap.totalActual,
      totalAporte: snap.totalAporte,
    };
    for (const si of snap.investments) {
      point[`inv_${si.id}`] = si.valorActual;
    }
    return point;
  });

  function toggleInv(id: number) {
    setSelectedInvIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

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
        {investments.map(inv => {
          const pct = totalActual > 0 ? (inv.valorActual / totalActual) * 100 : 0;
          return (
            <div
              key={inv.id}
              className={styles.distributionSegment}
              style={{ width: `${pct}%`, background: inv.color }}
              onMouseEnter={() => setHoveredId(inv.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {hoveredId === inv.id && (
                <div className={styles.segmentTooltip}>
                  <span className={styles.segmentTooltipDot} style={{ background: inv.color }} />
                  <span className={styles.segmentTooltipName}>{inv.name}</span>
                  <span className={styles.segmentTooltipValue}>{formatCLP(inv.valorActual)}</span>
                  <span className={styles.segmentTooltipPct}>{pct.toFixed(1)}%</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {byTipo.length > 0 && (
        <div className={styles.distribution}>
          {/* Izquierda: donut + leyenda */}
          <div className={styles.leftPanel}>
            <div className={styles.donutToggle}>
              <button
                className={`${styles.donutToggleBtn} ${donutMode === "tipo" ? styles.donutToggleActive : ""}`}
                onClick={() => setDonutMode("tipo")}
              >
                Por tipo
              </button>
              <button
                className={`${styles.donutToggleBtn} ${donutMode === "inversion" ? styles.donutToggleActive : ""}`}
                onClick={() => setDonutMode("inversion")}
              >
                Por inversión
              </button>
            </div>
            <div className={styles.donutWrap}>
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="total"
                    nameKey="tipo"
                    innerRadius={35}
                    outerRadius={82}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {donutData.map(t => (
                      <Cell key={t.tipo} fill={t.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#12121A", border: "1px solid #1E1E2E", borderRadius: 8, fontSize: 12, color: "#E8E6E1" }}
                    formatter={(val, name) => [typeof val === "number" ? formatCLP(val) : "", String(name)]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className={styles.legend}>
              {donutData.map(t => (
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

            {/* Toggles de líneas totales */}
            <div className={styles.lineToggles}>
              <button
                className={`${styles.lineToggleBtn} ${!showBalance ? styles.lineToggleOff : ""}`}
                onClick={() => setShowBalance(v => !v)}
              >
                <span className={styles.lineToggleSolid} style={{ background: showBalance ? "#4ECDC4" : "#333" }} />
                Balance total
              </button>
              <button
                className={`${styles.lineToggleBtn} ${!showBase ? styles.lineToggleOff : ""}`}
                onClick={() => setShowBase(v => !v)}
              >
                <span className={styles.lineToggleDashed} style={{ borderColor: showBase ? "#888" : "#333" }} />
                Base invertida
              </button>
            </div>

            {/* Chips por inversión individual */}
            {availableInvs.length > 0 && (
              <div className={styles.invChips}>
                {availableInvs.map(inv => {
                  const active = selectedInvIds.has(inv.id);
                  return (
                    <button
                      key={inv.id}
                      className={`${styles.invChip} ${active ? styles.invChipActive : ""}`}
                      style={active ? { borderColor: inv.color, color: inv.color } : {}}
                      onClick={() => toggleInv(inv.id)}
                    >
                      <span
                        className={styles.invChipDot}
                        style={{ background: active ? inv.color : "#444" }}
                      />
                      {inv.name}
                    </button>
                  );
                })}
              </div>
            )}

            {trendData.length >= 2 ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
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
                    formatter={(val, name) => {
                      if (typeof val !== "number") return ["", String(name)];
                      if (name === "totalActual") return [formatCLP(val), "Balance total"];
                      if (name === "totalAporte") return [formatCLP(val), "Base invertida"];
                      const inv = investments.find(i => `inv_${i.id}` === name);
                      return [formatCLP(val), inv?.name ?? String(name)];
                    }}
                    labelFormatter={label => formatDate(String(label))}
                  />
                  {showBalance && (
                    <Line type="monotone" dataKey="totalActual" stroke="#4ECDC4" strokeWidth={2} dot={false} name="totalActual" />
                  )}
                  {showBase && (
                    <Line type="monotone" dataKey="totalAporte" stroke="#666" strokeWidth={1.5} dot={false} strokeDasharray="4 4" name="totalAporte" />
                  )}
                  {investments
                    .filter(inv => selectedInvIds.has(inv.id))
                    .map(inv => (
                      <Line
                        key={inv.id}
                        type="monotone"
                        dataKey={`inv_${inv.id}`}
                        stroke={inv.color}
                        strokeWidth={1.5}
                        dot={false}
                        name={`inv_${inv.id}`}
                        connectNulls
                      />
                    ))
                  }
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.chartEmpty}>
                <span className={styles.chartEmptyIcon}>↗</span>
                <p className={styles.chartEmptyText}>Actualiza balances para ver la tendencia</p>
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
