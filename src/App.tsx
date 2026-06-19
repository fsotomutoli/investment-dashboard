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
import { GraficosView } from "./components/GraficosView";
import { loadLocalData, loadData, saveData } from "./storage";

// ---------------------------------------------------------------
// Demo data — shown at /demo (public, no auth required).
// ⚠️  Do NOT commit real financial data. Update values in the UI.
// ---------------------------------------------------------------

const DEMO_INVESTMENTS: Investment[] = [
  { id: 1, name: "Fondo Global Equity", platform: "LarrainVial", aporte: 5000000, valorActual: 5850000, tipo: "Alto riesgo", color: "#FF6B35", updatedAt: new Date().toISOString() },
  { id: 2, name: "Renta Fija CL", platform: "BTG Pactual", aporte: 3000000, valorActual: 3145000, tipo: "Conservador", color: "#4ECDC4", updatedAt: new Date().toISOString() },
  { id: 3, name: "Fondo Balanceado", platform: "LarrainVial", aporte: 2000000, valorActual: 2210000, tipo: "Moderado", color: "#A8E6CF", updatedAt: new Date().toISOString() },
  { id: 4, name: "Acciones Nacionales", platform: "Banchile", aporte: 1500000, valorActual: 1960000, tipo: "Alto riesgo", color: "#FF8B94", updatedAt: new Date().toISOString() },
  { id: 5, name: "Dólar Ahorro", platform: "Santander", aporte: 1000000, valorActual: 1115000, tipo: "Moderado", color: "#C9B1FF", updatedAt: new Date().toISOString() },
];

const NAV_ITEMS: ["resumen" | "gestionar" | "graficos" | "historial", string][] = [
  ["resumen", "Resumen"],
  ["gestionar", "Gestionar"],
  ["graficos", "Gráficos"],
  ["historial", "Historial"],
];

function buildSnapshot(invs: Investment[], currentHistory: Snapshot[]): Snapshot[] {
  const totalAporte = invs.reduce((s, i) => s + i.aporte, 0);
  const totalActual = invs.reduce((s, i) => s + i.valorActual, 0);
  const snap: Snapshot = {
    fecha: new Date().toISOString(),
    totalActual,
    totalAporte,
    ganancia: totalActual - totalAporte,
    pct: totalAporte === 0 ? 0 : ((totalActual - totalAporte) / totalAporte) * 100,
    investments: invs.map(inv => ({ id: inv.id, name: inv.name, valorActual: inv.valorActual, aporte: inv.aporte })),
  };
  return [snap, ...currentHistory].slice(0, 24);
}

export default function Dashboard() {
  const isDemo = window.location.pathname === "/demo";

  const [investments, setInvestments] = useState<Investment[]>(() =>
    isDemo ? DEMO_INVESTMENTS : loadLocalData().investments
  );
  const [history, setHistory] = useState<Snapshot[]>(() =>
    isDemo ? [] : loadLocalData().history
  );
  const [view, setView] = useState<"resumen" | "gestionar" | "graficos" | "historial">("resumen");
  const [modal, setModal] = useState<ModalState>(null);
  const [nuevoValor, setNuevoValor] = useState("");
  const [nuevoAporte, setNuevoAporte] = useState("");
  const [newInv, setNewInv] = useState<NewInvestmentForm>({
    name: "", platform: "", aporte: "", valorActual: "", tipo: "Moderado", color: "#FF6B35",
  });
  const [feedback, setFeedback] = useState("");
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from Sheets on mount (skipped in demo mode)
  useEffect(() => {
    if (isDemo) return;
    const local = loadLocalData();
    loadData(local).then(({ investments: loadedInv, history: loadedHist }) => {
      if (loadedInv.length > 0) setInvestments(loadedInv);
      setHistory(loadedHist);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => { if (feedbackTimer.current) clearTimeout(feedbackTimer.current); };
  }, []);

  function showFeedback(msg: string) {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    setFeedback(msg);
    feedbackTimer.current = setTimeout(() => setFeedback(""), 2000);
  }

  function persistAll(updatedInv: Investment[], updatedHist: Snapshot[]) {
    setInvestments(updatedInv);
    setHistory(updatedHist);
    if (!isDemo) saveData(updatedInv, updatedHist);
  }

  function persistInvestments(updatedInv: Investment[]) {
    setInvestments(updatedInv);
    if (!isDemo) saveData(updatedInv, history);
  }

  function handleActualizarValor() {
    if (modal?.type !== "valor") return;
    const val = parseFloat(nuevoValor);
    if (!Number.isFinite(val) || val <= 0) return;
    const updatedInv = investments.map(inv =>
      inv.id === modal.inv.id ? { ...inv, valorActual: val, updatedAt: new Date().toISOString() } : inv
    );
    persistAll(updatedInv, buildSnapshot(updatedInv, history));
    setModal(null); setNuevoValor("");
    showFeedback("✓ Valor actualizado");
  }

  function handleRegistrarAporte() {
    if (modal?.type !== "aporte") return;
    const val = parseFloat(nuevoAporte);
    if (!Number.isFinite(val) || val <= 0) return;
    const updatedInv = investments.map(inv =>
      inv.id === modal.inv.id
        ? { ...inv, aporte: inv.aporte + val, valorActual: inv.valorActual + val, updatedAt: new Date().toISOString() }
        : inv
    );
    persistAll(updatedInv, buildSnapshot(updatedInv, history));
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
    persistInvestments([...investments, inv]);
    setModal(null);
    setNewInv({ name: "", platform: "", aporte: "", valorActual: "", tipo: "Moderado", color: "#FF6B35" });
    showFeedback("✓ Inversión agregada");
  }

  function handleRemove(id: number) {
    persistInvestments(investments.filter(i => i.id !== id));
    setModal(null);
    showFeedback("✓ Inversión eliminada");
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
      {isDemo && (
        <div className={styles.demoBanner}>
          Modo Demo — los datos son ficticios
        </div>
      )}

      <div className={styles.body}>
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
              history={history}
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
          {view === "graficos" && (
            <GraficosView history={history} />
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
      </div>

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
