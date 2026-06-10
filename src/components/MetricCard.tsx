import styles from "./MetricCard.module.css";

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
  negative?: boolean;
}

export function MetricCard({ label, value, sub, positive, negative }: MetricCardProps) {
  const valueClass = positive ? styles.positive : negative ? styles.negative : "";
  return (
    <div className={styles.card}>
      <p className={styles.label}>{label}</p>
      <p className={`${styles.value} ${valueClass}`}>{value}</p>
      {sub && <p className={styles.sub}>{sub}</p>}
    </div>
  );
}
