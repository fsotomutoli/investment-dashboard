import styles from "./Modal.module.css";
import { ModalState, NewInvestmentForm } from "../types";
import { formatCLP, formatPct, calcPct } from "../utils";

const TIPOS = ["Alto riesgo", "Moderado", "Conservador", "Acción"] as const;
const COLORS = ["#FF6B35", "#4ECDC4", "#A8E6CF", "#88D8B0", "#FF8B94", "#C9B1FF", "#FFD93D", "#6BCB77"] as const;

interface ModalProps {
  modal: ModalState;
  onClose: () => void;
  nuevoValor: string;
  setNuevoValor: (v: string) => void;
  nuevoAporte: string;
  setNuevoAporte: (v: string) => void;
  newInv: NewInvestmentForm;
  setNewInv: (f: NewInvestmentForm) => void;
  onActualizarValor: () => void;
  onRegistrarAporte: () => void;
  onAddInvestment: () => void;
  onRemove: (id: number) => void;
}

export function Modal({
  modal, onClose,
  nuevoValor, setNuevoValor,
  nuevoAporte, setNuevoAporte,
  newInv, setNewInv,
  onActualizarValor, onRegistrarAporte,
  onAddInvestment, onRemove,
}: ModalProps) {
  if (!modal) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.dialog} slide-up`} onClick={e => e.stopPropagation()}>

        {modal.type === "valor" && (
          <>
            <div className={styles.header}>
              <div className={styles.colorAccent} style={{ background: modal.inv.color }} />
              <div>
                <p className={styles.subtitle}>Actualizar valor de mercado</p>
                <p className={styles.title}>{modal.inv.name}</p>
              </div>
            </div>
            <div className={styles.infoBox}>
              <p className={styles.infoLabel}>Valor actual</p>
              <p className={styles.infoValue}>{formatCLP(modal.inv.valorActual)}</p>
            </div>
            <label className={styles.label}>Nuevo valor de mercado ($)</label>
            <input
              autoFocus
              type="number"
              placeholder={String(modal.inv.valorActual)}
              value={nuevoValor}
              onChange={e => setNuevoValor(e.target.value)}
              className={styles.input}
            />
            {nuevoValor && parseFloat(nuevoValor) > 0 && (
              <div className={`${styles.previewBox} ${styles.previewPositive}`}>
                <p className={styles.previewText}>
                  Rentabilidad actualizada: {formatPct(calcPct(parseFloat(nuevoValor), modal.inv.aporte))}
                </p>
              </div>
            )}
            <div className={styles.actions}>
              <button className={styles.btnGhost} onClick={onClose}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={onActualizarValor}>Guardar</button>
            </div>
          </>
        )}

        {modal.type === "aporte" && (
          <>
            <div className={styles.header}>
              <div className={styles.colorAccent} style={{ background: modal.inv.color }} />
              <div>
                <p className={styles.subtitle}>Registrar nuevo aporte</p>
                <p className={styles.title}>{modal.inv.name}</p>
              </div>
            </div>
            <div className={styles.statsRow}>
              {([
                ["Aporte base", formatCLP(modal.inv.aporte)],
                ["Rentabilidad", formatPct(calcPct(modal.inv.valorActual, modal.inv.aporte))],
              ] as [string, string][]).map(([label, val]) => (
                <div key={label} className={styles.statBox}>
                  <p className={styles.statLabel}>{label}</p>
                  <p className={styles.statValue}>{val}</p>
                </div>
              ))}
            </div>
            <label className={styles.label}>Monto del nuevo aporte ($)</label>
            <input
              autoFocus
              type="number"
              placeholder="200000"
              value={nuevoAporte}
              onChange={e => setNuevoAporte(e.target.value)}
              className={styles.input}
            />
            {nuevoAporte && parseFloat(nuevoAporte) > 0 && (
              <div className={`${styles.previewBox} ${styles.previewNegative}`}>
                <p className={styles.previewTextWarning}>
                  ⚠️ Rentabilidad se ajustará a: {formatPct(calcPct(modal.inv.valorActual, modal.inv.aporte + parseFloat(nuevoAporte)))}
                </p>
                <p className={styles.previewSub}>
                  Nuevo aporte base: {formatCLP(modal.inv.aporte + parseFloat(nuevoAporte))}
                </p>
              </div>
            )}
            <div className={styles.actions}>
              <button className={styles.btnGhost} onClick={onClose}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={onRegistrarAporte}>Registrar aporte</button>
            </div>
          </>
        )}

        {modal.type === "add" && (
          <>
            <p className={styles.title} style={{ marginBottom: 20 }}>Nueva inversión</p>
            {([
              ["Nombre del fondo", "name", "text", "Ej: Global Equity Fund"],
              ["Plataforma", "platform", "text", "Ej: Fintual"],
              ["Aporte inicial ($)", "aporte", "number", "100000"],
              ["Valor actual ($)", "valorActual", "number", "Dejar vacío si igual al aporte"],
            ] as [string, keyof NewInvestmentForm, string, string][]).map(([label, key, type, ph]) => (
              <div key={key} className={styles.fieldGroup}>
                <label className={styles.label}>{label}</label>
                <input
                  type={type}
                  placeholder={ph}
                  value={newInv[key]}
                  onChange={e => setNewInv({ ...newInv, [key]: e.target.value })}
                  className={styles.input}
                />
              </div>
            ))}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Tipo</label>
              <select
                value={newInv.tipo}
                onChange={e => setNewInv({ ...newInv, tipo: e.target.value })}
                className={styles.input}
                style={{ cursor: "pointer" }}
              >
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className={styles.fieldGroup} style={{ marginBottom: 20 }}>
              <label className={styles.label}>Color</label>
              <div className={styles.colorPicker}>
                {COLORS.map(c => (
                  <div
                    key={c}
                    className={styles.colorDot}
                    style={{
                      background: c,
                      border: newInv.color === c ? "2px solid #fff" : "2px solid transparent",
                    }}
                    onClick={() => setNewInv({ ...newInv, color: c })}
                  />
                ))}
              </div>
            </div>
            <div className={styles.actions}>
              <button className={styles.btnGhost} onClick={onClose}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={onAddInvestment}>Agregar</button>
            </div>
          </>
        )}

        {modal.type === "remove" && (
          <>
            <p className={styles.removeText}>¿Eliminar inversión?</p>
            <p className={styles.removeDesc}>
              Esto eliminará <span className={styles.removeHighlight}>{modal.inv.name}</span> del dashboard. No afecta tu inversión real.
            </p>
            <div className={styles.actions}>
              <button className={styles.btnGhost} onClick={onClose}>Cancelar</button>
              <button className={styles.btnDanger} onClick={() => onRemove(modal.inv.id)}>Eliminar</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
