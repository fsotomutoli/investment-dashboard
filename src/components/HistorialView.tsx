import styles from "./HistorialView.module.css";
import { Snapshot } from "../types";
import { formatCLP, formatPct, formatDate } from "../utils";

interface HistorialViewProps {
  history: Snapshot[];
}

export function HistorialView({ history }: HistorialViewProps) {
  return (
    <div className={styles.view}>
      <p className={styles.sectionLabel}>Historial de snapshots</p>
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
