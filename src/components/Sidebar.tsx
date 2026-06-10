import styles from "./Sidebar.module.css";
import { formatCLP, formatPct } from "../utils";

type View = "resumen" | "gestionar" | "graficos" | "historial";

interface SidebarProps {
  view: View;
  onViewChange: (v: View) => void;
  totalActual: number;
  gananciaTotal: number;
  pctTotal: number;
}

const NAV_ITEMS: [View, string][] = [
  ["resumen", "Resumen"],
  ["gestionar", "Gestionar"],
  ["graficos", "Gráficos"],
  ["historial", "Historial"],
];

export function Sidebar({ view, onViewChange, totalActual, gananciaTotal, pctTotal }: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <p className={styles.logo}>Portafolio Personal</p>
      <p className={styles.totalValue}>{formatCLP(totalActual)}</p>
      <p className={styles.totalPct} style={{ color: pctTotal >= 0 ? "var(--accent)" : "var(--negative)" }}>
        {formatPct(pctTotal)}
      </p>
      <p className={styles.totalGanancia}>{formatCLP(gananciaTotal)} ganancia</p>
      <div className={styles.divider} />
      <nav className={styles.nav}>
        {NAV_ITEMS.map(([v, label]) => (
          <button
            key={v}
            className={`${styles.navItem} ${view === v ? styles.navItemActive : ""}`}
            onClick={() => onViewChange(v)}
          >
            <span className={styles.navDot} />
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
