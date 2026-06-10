import { useState, useRef, useEffect } from "react";
import styles from "./App.module.css";
import { Investment, Snapshot, ModalState, NewInvestmentForm } from "./types";
import { formatCLP, formatPct } from "./utils";
import { Sidebar } from "./components/Sidebar";
import { Modal } from "./components/Modal";
import { Toast } from "./components/Toast";
import { ResumenView } from "./components/ResumenView";
import { GestionarView } from "./components/GestionarView";
import { HistorialView } from "./components/HistorialView";

const STORAGE_KEY = "investment-dashboard-v2";
const HISTORY_KEY = "investment-history-v2";

// ---------------------------------------------------------------
// Configure your investments here.
// ⚠️  Do NOT commit real financial data to a public repository.
//     These are placeholder values — update them in the app UI
//     after launching locally.
// ---------------------------------------------------------------

const INITIAL_INVESTMENTS: Investment[] = [
  { id: 1, name: "Global Equity Fund", platform: "Platform A", aporte: 1000000, valorActual: 1200000, tipo: "Alto riesgo", color: "#FF6B35", updatedAt: new Date().toISOString() },
  { id: 2, name: "Fixed Income Fund", platform: "Platform A", aporte: 500000, valorActual: 520000, tipo: "Conservador", color: "#4ECDC4", updatedAt: new Date().toISOString() },
  { id: 3, name: "Balanced Fund", platform: "Platform B", aporte: 300000, valorActual: 340000, tipo: "Moderado", color: "#A8E6CF", updatedAt: new Date().toISOString() },
  { id: 4, name: "Tech Fund", platform: "Platform B", aporte: 200000, valorActual: 260000, tipo: "Alto riesgo", color: "#FF8B94", updatedAt: new Date().toISOString() },
  { id: 5, name: "Local Stocks", platform: "Broker", aporte: 100000, valorActual: 108000, tipo: "Acción", color: "#C9B1FF", updatedAt: new Date().toISOString() },
];

const NAV_ITEMS: ["resumen" | "gestionar" | "historial", string][] = [
  ["resumen", "Resumen"],
  ["gestionar", "Gestionar"],
  ["historial", "Historial"],
];

function isValidInvestment(v: unknown): v is Investment {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    Number.isInteger(o.id) && (o.id as number) > 0 &&
    typeof o.name === "string" &&
    typeof o.platform === "string" &&
    typeof o.aporte === "number" && Number.isFinite(o.aporte) && (o.aporte as number) > 0 &&
    typeof o.valorActual === "number" && Number.isFinite(o.valorActual) && (o.valorActual as number) >= 0 &&
    typeof o.tipo === "string" &&
    typeof o.color === "string" &&
    typeof o.updatedAt === "string"
  );
}

function isValidSnapshot(v: unknown): v is Snapshot {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.fecha === "string" &&
    typeof o.totalActual === "number" && Number.isFinite(o.totalActual) &&
    typeof o.totalAporte === "number" && Number.isFinite(o.totalAporte) &&
    typeof o.ganancia === "number" && Number.isFinite(o.ganancia) &&
    typeof o.pct === "number" && Number.isFinite(o.pct)
  );
}

export default function Dashboard() {
  const [investments, setInvestments] = useState<Investment[]>(() => {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
      if (Array.isArray(parsed) && parsed.every(isValidInvestment)) return parsed;
    } catch { /* ignore parse errors */ }
    return INITIAL_INVESTMENTS;
  });
  const [history, setHistory] = useState<Snapshot[]>(() => {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "null");
      if (Array.isArray(parsed) && parsed.every(isValidSnapshot)) return parsed;
    } catch { /* ignore parse errors */ }
    return [];
  });
  const [view, setView] = useState<"resumen" | "gestionar" | "historial">("resumen");
  const [modal, setModal] = useState<ModalState>(null);
  const [nuevoValor, setNuevoValor] = useState("");
  const [nuevoAporte, setNuevoAporte] = useState("");
  const [newInv, setNewInv] = useState<NewInvestmentForm>({
    name: "", platform: "", aporte: "", valorActual: "", tipo: "Moderado", color: "#FF6B35",
  });
  const [feedback, setFeedback] = useState("");
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (feedbackTimer.current) clearTimeout(feedbackTimer.current); };
  }, []);

  function persist(updated: Investment[]) {
    setInvestments(updated);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore storage errors */ }
  }

  function showFeedback(msg: string) {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    setFeedback(msg);
    feedbackTimer.current = setTimeout(() => setFeedback(""), 2000);
  }

  function handleActualizarValor() {
    if (modal?.type !== "valor") return;
    const val = parseFloat(nuevoValor);
    if (!Number.isFinite(val) || val <= 0) return;
    const updated = investments.map(inv =>
      inv.id === modal.inv.id ? { ...inv, valorActual: val, updatedAt: new Date().toISOString() } : inv
    );
    persist(updated);
    saveSnapshot(updated);
    setModal(null); setNuevoValor("");
    showFeedback("✓ Valor actualizado");
  }

  function handleRegistrarAporte() {
    if (modal?.type !== "aporte") return;
    const val = parseFloat(nuevoAporte);
    if (!Number.isFinite(val) || val <= 0) return;
    const updated = investments.map(inv =>
      inv.id === modal.inv.id
        ? { ...inv, aporte: inv.aporte + val, valorActual: inv.valorActual + val, updatedAt: new Date().toISOString() }
        : inv
    );
    persist(updated);
    saveSnapshot(updated);
    setModal(null); setNuevoAporte("");
    showFeedback("✓ Aporte registrado");
  }

  function handleAddInvestment() {
    const aporteVal = parseFloat(newInv.aporte);
    if (!newInv.name.trim() || !Number.isFinite(aporteVal) || aporteVal <= 0) return;
    const valorActualRaw = parseFloat(newInv.valorActual);
    const valorActualVal = Number.isFinite(valorActualRaw) && valorActualRaw > 0 ? valorActualRaw : aporteVal;
    const inv: Investment = {
      id: Math.max(...investments.map(i => i.id), 0) + 1,
      name: newInv.name.trim(),
      platform: newInv.platform.trim(),
      aporte: aporteVal,
      valorActual: valorActualVal,
      tipo: newInv.tipo,
      color: newInv.color,
      updatedAt: new Date().toISOString(),
    };
    persist([...investments, inv]);
    setModal(null);
    setNewInv({ name: "", platform: "", aporte: "", valorActual: "", tipo: "Moderado", color: "#FF6B35" });
    showFeedback("✓ Inversión agregada");
  }

  function handleRemove(id: number) {
    persist(investments.filter(i => i.id !== id));
    setModal(null);
    showFeedback("✓ Inversión eliminada");
  }

  function saveSnapshot(invs: Investment[] = investments) {
    const totalA = invs.reduce((s, i) => s + i.aporte, 0);
    const totalV = invs.reduce((s, i) => s + i.valorActual, 0);
    const snap: Snapshot = {
      fecha: new Date().toISOString(),
      totalActual: totalV,
      totalAporte: totalA,
      ganancia: totalV - totalA,
      pct: totalA === 0 ? 0 : ((totalV - totalA) / totalA) * 100,
    };
    setHistory(prev => {
      const newH = [snap, ...prev].slice(0, 24);
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(newH)); } catch { /* ignore storage errors */ }
      return newH;
    });
  }

  const totalAporte = investments.reduce((s, i) => s + i.aporte, 0);
  const totalActual = investments.reduce((s, i) => s + i.valorActual, 0);
  const gananciaTotal = totalActual - totalAporte;
  const pctTotal = totalAporte > 0 ? (gananciaTotal / totalAporte) * 100 : 0;
  const barMax = Math.max(...investments.map(i => i.valorActual), 1);
  const tipos = [...new Set(investments.map(i => i.tipo))];
  const byTipo = tipos.map(tipo => ({
    tipo,
    color: investments.find(i => i.tipo === tipo)?.color ?? "#888",
    total: investments.filter(i => i.tipo === tipo).reduce((s, i) => s + i.valorActual, 0),
  }));

  return (
    <div className={styles.layout}>
      <Sidebar
        view={view}
        onViewChange={setView}
        totalActual={totalActual}
        gananciaTotal={gananciaTotal}
        pctTotal={pctTotal}
      />

      <main className={styles.main}>
        {/* Mobile-only header */}
        <div className={styles.mobileHeader}>
          <p className={styles.mobileLabel}>Portafolio Personal</p>
          <h1 className={styles.mobileTotal}>{formatCLP(totalActual)}</h1>
          <p className={styles.mobilePct} style={{ color: pctTotal >= 0 ? "var(--accent)" : "var(--negative)" }}>
            {formatPct(pctTotal)}
          </p>
        </div>

        {view === "resumen" && (
          <ResumenView
            investments={investments}
            totalActual={totalActual}
            totalAporte={totalAporte}
            gananciaTotal={gananciaTotal}
            pctTotal={pctTotal}
            byTipo={byTipo}
            barMax={barMax}
            onCardClick={inv => { setNuevoValor(""); setModal({ type: "valor", inv }); }}
          />
        )}
        {view === "gestionar" && (
          <GestionarView
            investments={investments}
            onValorClick={inv => { setNuevoValor(String(inv.valorActual)); setModal({ type: "valor", inv }); }}
            onAporteClick={inv => { setNuevoAporte(""); setModal({ type: "aporte", inv }); }}
            onRemoveClick={inv => setModal({ type: "remove", inv })}
            onAddClick={() => setModal({ type: "add" })}
          />
        )}
        {view === "historial" && (
          <HistorialView history={history} />
        )}
      </main>

      {/* Mobile-only bottom nav */}
      <nav className={styles.mobileNav}>
        <div className={styles.mobileTabs}>
          {NAV_ITEMS.map(([v, label]) => (
            <button
              key={v}
              className={`${styles.mobileTab} ${view === v ? styles.mobileTabActive : ""}`}
              onClick={() => setView(v)}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      <Modal
        modal={modal}
        onClose={() => setModal(null)}
        nuevoValor={nuevoValor}
        setNuevoValor={setNuevoValor}
        nuevoAporte={nuevoAporte}
        setNuevoAporte={setNuevoAporte}
        newInv={newInv}
        setNewInv={setNewInv}
        onActualizarValor={handleActualizarValor}
        onRegistrarAporte={handleRegistrarAporte}
        onAddInvestment={handleAddInvestment}
        onRemove={handleRemove}
      />

      <Toast message={feedback} />
    </div>
  );
}
