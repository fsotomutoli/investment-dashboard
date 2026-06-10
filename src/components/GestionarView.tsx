import styles from "./GestionarView.module.css";
import { Investment } from "../types";
import { InvestmentCard } from "./InvestmentCard";

interface GestionarViewProps {
  investments: Investment[];
  onValorClick: (inv: Investment) => void;
  onAporteClick: (inv: Investment) => void;
  onRemoveClick: (inv: Investment) => void;
  onAddClick: () => void;
}

export function GestionarView({ investments, onValorClick, onAporteClick, onRemoveClick, onAddClick }: GestionarViewProps) {
  return (
    <div className={styles.view}>
      <p className={styles.sectionLabel}>Gestionar inversiones</p>
      <div className={styles.grid}>
        {investments.map(inv => (
          <InvestmentCard
            key={inv.id}
            mode="gestionar"
            investment={inv}
            onValorClick={() => onValorClick(inv)}
            onAporteClick={() => onAporteClick(inv)}
            onRemoveClick={() => onRemoveClick(inv)}
          />
        ))}
      </div>
      <button className={styles.addBtn} onClick={onAddClick}>
        + Agregar nueva inversión
      </button>
    </div>
  );
}
