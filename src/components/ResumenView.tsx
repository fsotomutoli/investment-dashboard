import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import styles from "./ResumenView.module.css";
import { Investment } from "../types";
import { MetricCard } from "./MetricCard";
import { InvestmentCard } from "./InvestmentCard";
import { formatCLP, formatPct } from "../utils";

interface ByTipo {
  tipo: string;
  color: string;
  total: number;
}

interface ResumenViewProps {
  investments: Investment[];
  totalActual: number;
  totalAporte: number;
  gananciaTotal: number;
  pctTotal: number;
  byTipo: ByTipo[];
  barMax: number;
  onCardClick: (inv: Investment) => void;
}

export function ResumenView({
  investments, totalActual, totalAporte, gananciaTotal, pctTotal, byTipo, barMax, onCardClick,
}: ResumenViewProps) {
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
