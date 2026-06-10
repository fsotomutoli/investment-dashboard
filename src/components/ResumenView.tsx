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

      <p className={styles.sectionLabel}>Por tipo</p>
      <div className={styles.tipoGrid}>
        {byTipo.map(t => (
          <div key={t.tipo} className={styles.tipoCard}>
            <p className={styles.tipoNombre}>
              <span className={styles.tipoDot} style={{ background: t.color }} />
              {t.tipo}
            </p>
            <p className={styles.tipoTotal}>{formatCLP(t.total)}</p>
            <p className={styles.tipoPct}>
              {(totalActual > 0 ? (t.total / totalActual) * 100 : 0).toFixed(1)}%
            </p>
          </div>
        ))}
      </div>

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
