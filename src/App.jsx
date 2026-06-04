import { useState, useEffect } from "react";

const STORAGE_KEY = "investment-dashboard-v2";
const HISTORY_KEY = "investment-history-v2";

// ---------------------------------------------------------------
// Configure your investments here.
// ⚠️  Do NOT commit real financial data to a public repository.
//     These are placeholder values — update them in the app UI
//     after launching locally.
// ---------------------------------------------------------------
const INITIAL_INVESTMENTS = [
  { id: 1, name: "Global Equity Fund", platform: "Platform A", aporte: 1000000, valorActual: 1200000, tipo: "Alto riesgo", color: "#FF6B35", updatedAt: new Date().toISOString() },
  { id: 2, name: "Fixed Income Fund", platform: "Platform A", aporte: 500000, valorActual: 520000, tipo: "Conservador", color: "#4ECDC4", updatedAt: new Date().toISOString() },
  { id: 3, name: "Balanced Fund", platform: "Platform B", aporte: 300000, valorActual: 340000, tipo: "Moderado", color: "#A8E6CF", updatedAt: new Date().toISOString() },
  { id: 4, name: "Tech Fund", platform: "Platform B", aporte: 200000, valorActual: 260000, tipo: "Alto riesgo", color: "#FF8B94", updatedAt: new Date().toISOString() },
  { id: 5, name: "Local Stocks", platform: "Broker", aporte: 100000, valorActual: 108000, tipo: "Acción", color: "#C9B1FF", updatedAt: new Date().toISOString() },
];

function formatCLP(n) {
  return "$" + Math.round(n).toLocaleString("es-CL");
}
function formatPct(n) {
  return (n >= 0 ? "+" : "") + n.toFixed(1) + "%";
}
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
}

const TIPOS = ["Alto riesgo", "Moderado", "Conservador", "Acción"];
const COLORS = ["#FF6B35", "#4ECDC4", "#A8E6CF", "#88D8B0", "#FF8B94", "#C9B1FF", "#FFD93D", "#6BCB77"];

export default function Dashboard() {
  const [investments, setInvestments] = useState(INITIAL_INVESTMENTS);
  const [history, setHistory] = useState([]);
  const [view, setView] = useState("resumen");
  const [modal, setModal] = useState(null);
  const [nuevoValor, setNuevoValor] = useState("");
  const [nuevoAporte, setNuevoAporte] = useState("");
  const [newInv, setNewInv] = useState({ name: "", platform: "", aporte: "", valorActual: "", tipo: "Moderado", color: "#FF6B35" });
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setInvestments(JSON.parse(raw));
      const rawH = localStorage.getItem(HISTORY_KEY);
      if (rawH) setHistory(JSON.parse(rawH));
    } catch (e) {}
  }, []);

  function persist(updated) {
    setInvestments(updated);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch (e) {}
  }

  function showFeedback(msg) {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 2000);
  }

  function handleActualizarValor() {
    const val = parseFloat(nuevoValor);
    if (!val || val <= 0) return;
    const updated = investments.map(inv =>
      inv.id === modal.inv.id ? { ...inv, valorActual: val, updatedAt: new Date().toISOString() } : inv
    );
    persist(updated);
    saveSnapshot(updated);
    setModal(null); setNuevoValor("");
    showFeedback("✓ Valor actualizado");
  }

  function handleRegistrarAporte() {
    const val = parseFloat(nuevoAporte);
    if (!val || val <= 0) return;
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
    if (!newInv.name || !newInv.aporte) return;
    const inv = {
      id: Date.now(), name: newInv.name, platform: newInv.platform,
      aporte: parseFloat(newInv.aporte),
      valorActual: parseFloat(newInv.valorActual) || parseFloat(newInv.aporte),
      tipo: newInv.tipo, color: newInv.color, updatedAt: new Date().toISOString()
    };
    persist([...investments, inv]);
    setModal(null);
    setNewInv({ name: "", platform: "", aporte: "", valorActual: "", tipo: "Moderado", color: "#FF6B35" });
    showFeedback("✓ Inversión agregada");
  }

  function handleRemove(id) {
    persist(investments.filter(i => i.id !== id));
    setModal(null);
    showFeedback("✓ Inversión eliminada");
  }

  function saveSnapshot(invs = investments) {
    const totalA = invs.reduce((s, i) => s + i.aporte, 0);
    const totalV = invs.reduce((s, i) => s + i.valorActual, 0);
    const snap = { fecha: new Date().toISOString(), totalActual: totalV, totalAporte: totalA, ganancia: totalV - totalA, pct: ((totalV - totalA) / totalA) * 100 };
    setHistory(prev => {
      const newH = [snap, ...prev].slice(0, 24);
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(newH)); } catch (e) {}
      return newH;
    });
  }

  const totalAporte = investments.reduce((s, i) => s + i.aporte, 0);
  const totalActual = investments.reduce((s, i) => s + i.valorActual, 0);
  const gananciaTotal = totalActual - totalAporte;
  const pctTotal = (gananciaTotal / totalAporte) * 100;
  const barMax = Math.max(...investments.map(i => i.valorActual), 1);
  const tipos = [...new Set(investments.map(i => i.tipo))];
  const byTipo = tipos.map(tipo => ({
    tipo, color: investments.find(i => i.tipo === tipo)?.color,
    total: investments.filter(i => i.tipo === tipo).reduce((s, i) => s + i.valorActual, 0),
  }));

  const inputStyle = { width: "100%", background: "#1A1A28", border: "1px solid #252535", borderRadius: 8, padding: "10px 12px", color: "#E0DDD8", fontSize: 14, fontFamily: "'DM Mono', monospace", outline: "none" };
  const labelStyle = { fontSize: 10, color: "#555", marginBottom: 5, letterSpacing: 1, textTransform: "uppercase" };
  const primaryBtn = { width: "100%", padding: "13px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #4ECDC4, #44B8B0)", color: "#0A0A0F", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" };
  const ghostBtn = { width: "100%", padding: "12px", borderRadius: 10, border: "1px solid #252535", background: "none", color: "#666", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif" };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", color: "#E8E6E1", fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, select { outline: none; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #2A2A3A; border-radius: 2px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.35s ease forwards; }
        @keyframes slideUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        .slide-up { animation: slideUp 0.25s ease forwards; }
        .inv-card:hover { background: #111120 !important; }
        .action-pill { transition: all 0.15s; }
        .action-pill:hover { opacity: 0.85; transform: translateY(-1px); }
        @keyframes toastIn { from { opacity:0; transform:translateY(10px) translateX(-50%); } to { opacity:1; transform:translateY(0) translateX(-50%); } }
      `}</style>

      {/* TOAST */}
      {feedback && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#1E2E28", border: "1px solid #4ECDC4", color: "#4ECDC4", padding: "10px 20px", borderRadius: 20, fontSize: 13, zIndex: 100, fontWeight: 500, whiteSpace: "nowrap", animation: "toastIn 0.2s ease forwards" }}>
          {feedback}
        </div>
      )}

      {/* MODAL */}
      {modal && (
        <div onClick={() => setModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 50, display: "flex", alignItems: "flex-end" }}>
          <div onClick={e => e.stopPropagation()} className="slide-up" style={{ width: "100%", maxWidth: 560, margin: "0 auto", background: "#12121A", borderRadius: "20px 20px 0 0", padding: "24px 20px 36px", border: "1px solid #1E1E2E" }}>

            {modal.type === "valor" && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 4, height: 32, borderRadius: 2, background: modal.inv.color }} />
                  <div>
                    <p style={{ fontSize: 12, color: "#666" }}>Actualizar valor de mercado</p>
                    <p style={{ fontSize: 15, fontWeight: 500 }}>{modal.inv.name}</p>
                  </div>
                </div>
                <div style={{ background: "#0E0E18", borderRadius: 10, padding: "12px 14px", marginBottom: 16, border: "1px solid #161622" }}>
                  <p style={{ fontSize: 10, color: "#555", marginBottom: 2 }}>VALOR ACTUAL</p>
                  <p style={{ fontSize: 18, fontFamily: "'DM Mono', monospace" }}>{formatCLP(modal.inv.valorActual)}</p>
                </div>
                <p style={labelStyle}>Nuevo valor de mercado ($)</p>
                <input autoFocus type="number" placeholder={modal.inv.valorActual} value={nuevoValor} onChange={e => setNuevoValor(e.target.value)} style={{ ...inputStyle, marginBottom: 16 }} />
                {nuevoValor && parseFloat(nuevoValor) > 0 && (
                  <div style={{ background: "#0E1A18", borderRadius: 8, padding: "10px 14px", marginBottom: 16, border: "1px solid #1A2E28" }}>
                    <p style={{ fontSize: 11, color: "#4ECDC4" }}>Rentabilidad actualizada: {formatPct(((parseFloat(nuevoValor) - modal.inv.aporte) / modal.inv.aporte) * 100)}</p>
                  </div>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setModal(null)} style={{ ...ghostBtn, flex: 1 }}>Cancelar</button>
                  <button onClick={handleActualizarValor} style={{ ...primaryBtn, flex: 2 }}>Guardar</button>
                </div>
              </>
            )}

            {modal.type === "aporte" && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 4, height: 32, borderRadius: 2, background: modal.inv.color }} />
                  <div>
                    <p style={{ fontSize: 12, color: "#666" }}>Registrar nuevo aporte</p>
                    <p style={{ fontSize: 15, fontWeight: 500 }}>{modal.inv.name}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  {[["Aporte base", formatCLP(modal.inv.aporte)], ["Rentabilidad", formatPct(((modal.inv.valorActual - modal.inv.aporte) / modal.inv.aporte) * 100)]].map(([label, val]) => (
                    <div key={label} style={{ flex: 1, background: "#0E0E18", borderRadius: 10, padding: "12px", border: "1px solid #161622" }}>
                      <p style={{ fontSize: 10, color: "#555", marginBottom: 4 }}>{label}</p>
                      <p style={{ fontSize: 14, fontFamily: "'DM Mono', monospace" }}>{val}</p>
                    </div>
                  ))}
                </div>
                <p style={labelStyle}>Monto del nuevo aporte ($)</p>
                <input autoFocus type="number" placeholder="200000" value={nuevoAporte} onChange={e => setNuevoAporte(e.target.value)} style={{ ...inputStyle, marginBottom: 12 }} />
                {nuevoAporte && parseFloat(nuevoAporte) > 0 && (
                  <div style={{ background: "#0E1418", borderRadius: 8, padding: "10px 14px", marginBottom: 16, border: "1px solid #2A1A10" }}>
                    <p style={{ fontSize: 11, color: "#FF8B94", marginBottom: 3 }}>⚠️ Rentabilidad se ajustará a: {formatPct(((modal.inv.valorActual - (modal.inv.aporte + parseFloat(nuevoAporte))) / (modal.inv.aporte + parseFloat(nuevoAporte))) * 100)}</p>
                    <p style={{ fontSize: 10, color: "#555" }}>Nuevo aporte base: {formatCLP(modal.inv.aporte + parseFloat(nuevoAporte))}</p>
                  </div>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setModal(null)} style={{ ...ghostBtn, flex: 1 }}>Cancelar</button>
                  <button onClick={handleRegistrarAporte} style={{ ...primaryBtn, flex: 2 }}>Registrar aporte</button>
                </div>
              </>
            )}

            {modal.type === "add" && (
              <>
                <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 20 }}>Nueva inversión</p>
                {[["Nombre del fondo", "name", "text", "Ej: Global Equity Fund"], ["Plataforma", "platform", "text", "Ej: Fintual"], ["Aporte inicial ($)", "aporte", "number", "100000"], ["Valor actual ($)", "valorActual", "number", "Dejar vacío si igual al aporte"]].map(([label, key, type, ph]) => (
                  <div key={key} style={{ marginBottom: 12 }}>
                    <p style={labelStyle}>{label}</p>
                    <input type={type} placeholder={ph} value={newInv[key]} onChange={e => setNewInv({ ...newInv, [key]: e.target.value })} style={inputStyle} />
                  </div>
                ))}
                <div style={{ marginBottom: 12 }}>
                  <p style={labelStyle}>Tipo</p>
                  <select value={newInv.tipo} onChange={e => setNewInv({ ...newInv, tipo: e.target.value })} style={inputStyle}>
                    {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <p style={labelStyle}>Color</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {COLORS.map(c => (
                      <div key={c} onClick={() => setNewInv({ ...newInv, color: c })} style={{ width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer", border: newInv.color === c ? "2px solid #fff" : "2px solid transparent", transition: "border 0.15s" }} />
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setModal(null)} style={{ ...ghostBtn, flex: 1 }}>Cancelar</button>
                  <button onClick={handleAddInvestment} style={{ ...primaryBtn, flex: 2 }}>Agregar</button>
                </div>
              </>
            )}

            {modal.type === "remove" && (
              <>
                <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>¿Eliminar inversión?</p>
                <p style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>Esto eliminará <span style={{ color: "#E0DDD8" }}>{modal.inv.name}</span> del dashboard. No afecta tu inversión real.</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setModal(null)} style={{ ...ghostBtn, flex: 1 }}>Cancelar</button>
                  <button onClick={() => handleRemove(modal.inv.id)} style={{ ...primaryBtn, flex: 2, background: "linear-gradient(135deg, #FF6B6B, #E55)" }}>Eliminar</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{ background: "linear-gradient(180deg, #12121A 0%, #0A0A0F 100%)", borderBottom: "1px solid #1E1E2E", padding: "24px 20px 16px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: 3, color: "#444", textTransform: "uppercase", marginBottom: 4, fontFamily: "'DM Mono', monospace" }}>Portafolio Personal</p>
            <h1 style={{ fontSize: 30, fontWeight: 300, letterSpacing: -0.5, color: "#F0EDE8" }}>{formatCLP(totalActual)}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: gananciaTotal >= 0 ? "#4ECDC4" : "#FF6B6B", fontFamily: "'DM Mono', monospace" }}>{formatPct(pctTotal)}</span>
              <span style={{ fontSize: 11, color: "#444" }}>·</span>
              <span style={{ fontSize: 12, color: "#666" }}>{formatCLP(gananciaTotal)} ganancia</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 10, color: "#444", fontFamily: "'DM Mono', monospace" }}>{new Date().toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}</p>
            <p style={{ fontSize: 10, color: "#333", marginTop: 2, fontFamily: "'DM Mono', monospace" }}>BASE {formatCLP(totalAporte)}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 3, background: "#0E0E16", borderRadius: 10, padding: 3 }}>
          {[["resumen", "Resumen"], ["gestionar", "Gestionar"], ["historial", "Historial"]].map(([v, label]) => (
            <button key={v} onClick={() => setView(v)} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", background: view === v ? "#1E1E2E" : "transparent", color: view === v ? "#E8E6E1" : "#555", transition: "all 0.2s" }}>{label}</button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ padding: "20px 16px", maxWidth: 560, margin: "0 auto" }}>

        {view === "resumen" && (
          <div className="fade-up">
            <div style={{ height: 5, borderRadius: 3, display: "flex", gap: 2, marginBottom: 20, overflow: "hidden" }}>
              {investments.map(inv => (
                <div key={inv.id} style={{ height: "100%", width: ((inv.valorActual / totalActual) * 100) + "%", background: inv.color, borderRadius: 2 }} />
              ))}
            </div>
            <p style={{ fontSize: 10, letterSpacing: 2, color: "#444", textTransform: "uppercase", marginBottom: 10, fontFamily: "'DM Mono', monospace" }}>Por tipo</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
              {byTipo.map(t => (
                <div key={t.tipo} style={{ flex: "1 1 auto", minWidth: 90, background: "#0E0E18", borderRadius: 10, padding: "12px", border: "1px solid #161622" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: t.color }} />
                    <span style={{ fontSize: 10, color: "#666" }}>{t.tipo}</span>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 500 }}>{formatCLP(t.total)}</p>
                  <p style={{ fontSize: 10, color: "#555", fontFamily: "'DM Mono', monospace", marginTop: 2 }}>{((t.total / totalActual) * 100).toFixed(1)}%</p>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 10, letterSpacing: 2, color: "#444", textTransform: "uppercase", marginBottom: 10, fontFamily: "'DM Mono', monospace" }}>Inversiones</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {investments.map(inv => {
                const pct = ((inv.valorActual - inv.aporte) / inv.aporte) * 100;
                return (
                  <div key={inv.id} className="inv-card" onClick={() => setModal({ type: "valor", inv })} style={{ background: "#0E0E18", borderRadius: 12, padding: "14px", border: "1px solid #161622", position: "relative", overflow: "hidden", transition: "background 0.2s", cursor: "pointer" }}>
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: ((inv.valorActual / barMax) * 100) + "%", background: inv.color + "07", pointerEvents: "none" }} />
                    <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 3, height: 38, borderRadius: 2, background: inv.color, flexShrink: 0 }} />
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 500, color: "#E0DDD8", marginBottom: 2 }}>{inv.name}</p>
                          <p style={{ fontSize: 10, color: "#555" }}>{inv.platform} · {inv.tipo}</p>
                          <p style={{ fontSize: 9, color: "#383838", marginTop: 3, fontFamily: "'DM Mono', monospace" }}>Act. {formatDate(inv.updatedAt)}</p>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: 14, fontWeight: 500, color: "#E0DDD8", fontFamily: "'DM Mono', monospace" }}>{formatCLP(inv.valorActual)}</p>
                        <p style={{ fontSize: 11, color: pct >= 0 ? "#4ECDC4" : "#FF6B6B", fontFamily: "'DM Mono', monospace", marginTop: 2 }}>{formatPct(pct)}</p>
                        <p style={{ fontSize: 9, color: "#444", marginTop: 2, fontFamily: "'DM Mono', monospace" }}>base {formatCLP(inv.aporte)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: 10, color: "#383838", textAlign: "center", marginTop: 14 }}>Toca una inversión para actualizar su valor</p>
          </div>
        )}

        {view === "gestionar" && (
          <div className="fade-up">
            <p style={{ fontSize: 10, letterSpacing: 2, color: "#444", textTransform: "uppercase", marginBottom: 16, fontFamily: "'DM Mono', monospace" }}>Gestionar inversiones</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
              {investments.map(inv => {
                const pct = ((inv.valorActual - inv.aporte) / inv.aporte) * 100;
                return (
                  <div key={inv.id} style={{ background: "#0E0E18", borderRadius: 12, padding: "14px", border: "1px solid #161622" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 3, height: 32, borderRadius: 2, background: inv.color }} />
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 500 }}>{inv.name}</p>
                          <p style={{ fontSize: 10, color: "#555" }}>{inv.platform} · Act. {formatDate(inv.updatedAt)}</p>
                        </div>
                      </div>
                      <button onClick={() => setModal({ type: "remove", inv })} style={{ background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "2px 6px" }}>×</button>
                    </div>
                    <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                      {[["Base", formatCLP(inv.aporte), "#555"], ["Actual", formatCLP(inv.valorActual), "#E0DDD8"], ["Rent.", formatPct(pct), pct >= 0 ? "#4ECDC4" : "#FF6B6B"]].map(([label, val, color]) => (
                        <div key={label} style={{ flex: 1, background: "#0A0A12", borderRadius: 8, padding: "8px 10px" }}>
                          <p style={{ fontSize: 9, color: "#444", marginBottom: 3 }}>{label}</p>
                          <p style={{ fontSize: 12, color, fontFamily: "'DM Mono', monospace" }}>{val}</p>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="action-pill" onClick={() => { setNuevoValor(inv.valorActual); setModal({ type: "valor", inv }); }} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "1px solid #252535", background: "none", color: "#888", cursor: "pointer", fontSize: 11, fontFamily: "'DM Sans', sans-serif" }}>📈 Actualizar valor</button>
                      <button className="action-pill" onClick={() => { setNuevoAporte(""); setModal({ type: "aporte", inv }); }} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "1px solid #2A2A1A", background: "#1A1A0A", color: "#A8A870", cursor: "pointer", fontSize: 11, fontFamily: "'DM Sans', sans-serif" }}>➕ Nuevo aporte</button>
                    </div>
                  </div>
                );
              })}
            </div>
            <button onClick={() => setModal({ type: "add" })} style={{ width: "100%", padding: "13px", borderRadius: 12, border: "1px dashed #252535", background: "none", color: "#555", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>+ Agregar nueva inversión</button>
          </div>
        )}

        {view === "historial" && (
          <div className="fade-up">
            <p style={{ fontSize: 10, letterSpacing: 2, color: "#444", textTransform: "uppercase", marginBottom: 16, fontFamily: "'DM Mono', monospace" }}>Historial de snapshots</p>
            {history.length === 0 ? (
              <div style={{ background: "#0E0E18", borderRadius: 12, padding: "40px 20px", textAlign: "center", border: "1px solid #161622" }}>
                <p style={{ color: "#444", fontSize: 13 }}>Aún no hay snapshots.</p>
                <p style={{ color: "#333", fontSize: 11, marginTop: 6 }}>Se registran automáticamente al actualizar un valor o aporte.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {history.map((snap, i) => (
                  <div key={i} style={{ background: "#0E0E18", borderRadius: 10, padding: "14px 16px", border: "1px solid #161622", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ fontSize: 11, color: "#555", fontFamily: "'DM Mono', monospace", marginBottom: 4 }}>{formatDate(snap.fecha)}</p>
                      <p style={{ fontSize: 17, fontWeight: 500 }}>{formatCLP(snap.totalActual)}</p>
                      <p style={{ fontSize: 10, color: "#444", marginTop: 2, fontFamily: "'DM Mono', monospace" }}>base {formatCLP(snap.totalAporte)}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: 13, fontFamily: "'DM Mono', monospace", color: snap.pct >= 0 ? "#4ECDC4" : "#FF6B6B", fontWeight: 500 }}>{formatPct(snap.pct)}</p>
                      <p style={{ fontSize: 11, color: "#555", marginTop: 3 }}>{snap.ganancia >= 0 ? "+" : ""}{formatCLP(snap.ganancia)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
