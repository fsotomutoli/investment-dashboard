import styles from "./InvestmentCard.module.css";
import { Investment } from "../types";
import { formatCLP, formatPct, formatDate, calcPct } from "../utils";

interface ResumenProps {
  mode: "resumen";
  investment: Investment;
  barMax: number;
  onClick: () => void;
}

interface GestionarProps {
  mode: "gestionar";
  investment: Investment;
  onValorClick: () => void;
  onAporteClick: () => void;
  onRemoveClick: () => void;
}

type InvestmentCardProps = ResumenProps | GestionarProps;

export function InvestmentCard(props: InvestmentCardProps) {
  const { investment: inv, mode } = props;
  const pct = calcPct(inv.valorActual, inv.aporte);
  const pctClass = pct >= 0 ? styles.positive : styles.negative;

  if (mode === "resumen") {
    const { barMax, onClick } = props;
    return (
      <div className={`${styles.card} ${styles.clickable}`} onClick={onClick}>
        <div
          className={styles.bgBar}
          style={{ width: `${(inv.valorActual / barMax) * 100}%`, background: `${inv.color}07` }}
        />
        <div className={styles.content}>
          <div className={styles.leftSide}>
            <div className={styles.colorBar} style={{ background: inv.color, height: 38 }} />
            <div>
              <p className={styles.name}>{inv.name}</p>
              <p className={styles.meta}>{inv.platform} · {inv.tipo}</p>
              <p className={styles.updatedAt}>Act. {formatDate(inv.updatedAt)}</p>
            </div>
          </div>
          <div className={styles.rightSide}>
            <p className={styles.valor}>{formatCLP(inv.valorActual)}</p>
            <p className={`${styles.pct} ${pctClass}`}>{formatPct(pct)}</p>
            <p className={styles.aporte}>base {formatCLP(inv.aporte)}</p>
          </div>
        </div>
      </div>
    );
  }

  const { onValorClick, onAporteClick, onRemoveClick } = props;
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.leftSide}>
          <div className={styles.colorBar} style={{ background: inv.color, height: 32 }} />
          <div>
            <p className={styles.name}>{inv.name}</p>
            <p className={styles.meta}>{inv.platform} · Act. {formatDate(inv.updatedAt)}</p>
          </div>
        </div>
        <button className={styles.removeBtn} onClick={onRemoveClick}>×</button>
      </div>
      <div className={styles.stats}>
        {([
          ["Base", formatCLP(inv.aporte), ""],
          ["Actual", formatCLP(inv.valorActual), ""],
          ["Rent.", formatPct(pct), pctClass],
        ] as [string, string, string][]).map(([label, val, cls]) => (
          <div key={label} className={styles.statBox}>
            <p className={styles.statLabel}>{label}</p>
            <p className={`${styles.statValue} ${cls}`}>{val}</p>
          </div>
        ))}
      </div>
      <div className={styles.actions}>
        <button className={styles.actionBtn} onClick={onValorClick}>📈 Actualizar valor</button>
        <button className={`${styles.actionBtn} ${styles.actionBtnAporte}`} onClick={onAporteClick}>➕ Nuevo aporte</button>
      </div>
    </div>
  );
}
