/**
 * App.jsx
 * Componente raíz, controla toda la interfaz del Knapsack Smart Router.
 */

import { usarMochila } from "./hooks/usarMochila";
import { ALGORITMOS } from "./algoritmos/agenteIA";
import TablaObjetos from "./componentes/TablaObjetos";
import DecisionAgente from "./componentes/DecisionAgente";
import PanelEstadisticas from "./componentes/PanelEstadisticas";

// ── Componentes pequeños inline ───────────────────────────────────────────────

function SectionCard({ children, style }) {
  return (
    <div style={{
      background: "var(--color-background-primary)",
      border: "0.5px solid var(--color-border-tertiary)",
      borderRadius: "var(--border-radius-lg)",
      padding: "1rem 1.25rem",
      marginBottom: "1rem",
      ...style,
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <p style={{
      fontFamily: "var(--font-mono)",
      fontSize: "10px", fontWeight: 500,
      color: "var(--color-text-secondary)",
      textTransform: "uppercase", letterSpacing: ".12em",
      marginBottom: "16px",
      display: "flex", alignItems: "center", gap: "8px",
    }}>
      {children}
      <span style={{ flex: 1, height: "1px", background: "#252A38", display: "block" }} />
    </p>
  );
}

function Btn({ children, onClick, disabled, primary }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: "inline-flex", alignItems: "center", gap: "7px",
      padding: "9px 18px",
      borderRadius: "var(--border-radius-md)",
      border: primary ? "1px solid #00E5A0" : "1px solid #252A38",
      background: primary ? "#00E5A0" : "transparent",
      color: primary ? "#000" : "var(--color-text-secondary)",
      fontFamily: primary ? "var(--font-sans)" : "var(--font-sans)",
      fontWeight: primary ? 600 : 500,
      fontSize: "13px",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.35 : 1,
      transition: "all .2s",
      whiteSpace: "nowrap",
    }}>
      {children}
    </button>
  );
}

function StatusBar({ fase, mensaje, error }) {
  if (fase === "idle") return null;
  const config = {
    consultando: { bg: "var(--color-background-info)", color: "var(--color-text-info)", icono: "⟳" },
    ejecutando:  { bg: "var(--color-background-info)", color: "var(--color-text-info)", icono: "⟳" },
    listo:       { bg: "var(--color-background-success)", color: "var(--color-text-success)", icono: "✓" },
    error:       { bg: "var(--color-background-danger)", color: "var(--color-text-danger)", icono: "✗" },
  };
  const c = config[fase] || config.error;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "8px",
      background: c.bg, color: c.color,
      borderRadius: "var(--border-radius-md)",
      padding: "0.75rem 1rem", fontSize: "13px", marginBottom: "1rem",
    }}>
      <span style={fase === "consultando" || fase === "ejecutando"
        ? { animation: "spin 1s linear infinite", display: "inline-block" } : {}}>
        {c.icono}
      </span>
      {fase === "error" ? error : mensaje}
    </div>
  );
}

// ── Etiquetas legibles para cada algoritmo ────────────────────────────────────
const ETIQUETAS_ALGORITMO = {
  auto:                        "Automático (agente de IA)",
  [ALGORITMOS.BACKTRACKING]:   "Backtracking",
  [ALGORITMOS.PROGRAMACION_DINAMICA]: "Programación Dinámica",
  [ALGORITMOS.GREEDY]:         "Ávido (Greedy)",
};

// ── App principal ─────────────────────────────────────────────────────────────

export default function App() {
  const {
    objetos, capacidad, setCapacidad,
    n, setN, prioridad, setPrioridad,
    tiempoLimite, setTiempoLimite, apiKey, setApiKey,
    algoritmoManual, setAlgoritmoManual,
    fase, mensajeFase, error,
    decisionAgente, resultadoDP,
    generarAleatorio, resolver, soloDP,
  } = usarMochila();

  const cargando    = fase === "consultando" || fase === "ejecutando";
  const modoManual  = algoritmoManual !== "auto";

  // IDs seleccionados para resaltar en la tabla
  const idsSeleccionados = resultadoDP?.objetosSeleccionados ?? [];

  // etiqueta del botón principal
  const labelBoton = cargando
    ? "Procesando..."
    : modoManual
      ? `Ejecutar ${ETIQUETAS_ALGORITMO[algoritmoManual]} ↗`
      : "Consultar agente y resolver ↗";

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "2rem 1rem", fontFamily: "var(--font-sans)" }}>
      <h1 style={{ fontSize: "22px", fontWeight: 500, marginBottom: "0.25rem" }}>
        Knapsack Smart Router
      </h1>
      <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginBottom: "2rem" }}>
        IC-3002 — Agente Inteligente de Enrutamiento para el Problema de la Mochila
      </p>

      {/* ── Credenciales ── */}
      <SectionCard>
        <SectionTitle>Credenciales del agente</SectionTitle>
        <label style={{ fontSize: "12px", color: "var(--color-text-secondary)", display: "block", marginBottom: "4px" }}>
          API Key de Gemini (confidencial)
        </label>
        <input
          type="password"
          placeholder="AIza..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          disabled={modoManual}
          style={{ width: "100%", opacity: modoManual ? 0.4 : 1 }}
        />
        
      </SectionCard>

      {/* ── Configuración del problema ── */}
      <SectionCard>
        <SectionTitle>Configuración del problema</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
          <div>
            <label style={{ fontSize: "12px", color: "var(--color-text-secondary)", display: "block", marginBottom: "4px" }}>
              Objetos (N) — 4 a 25
            </label>
            <input type="number" min={4} max={25} value={n}
              onChange={(e) => setN(Math.max(4, Math.min(25, parseInt(e.target.value) || 4)))} />
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "var(--color-text-secondary)", display: "block", marginBottom: "4px" }}>
              Capacidad (W)
            </label>
            <input type="number" min={1} max={9999} value={capacidad}
              onChange={(e) => setCapacidad(parseInt(e.target.value) || 1)} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <Btn onClick={generarAleatorio}>↻ Generar objetos</Btn>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label style={{ fontSize: "12px", color: "var(--color-text-secondary)", display: "block", marginBottom: "4px" }}>
              Prioridad del usuario
            </label>
            <select value={prioridad} onChange={(e) => setPrioridad(e.target.value)}
              style={{ width: "100%", opacity: modoManual ? 0.4 : 1 }} disabled={modoManual}>
              <option value="exactitud">Máxima exactitud</option>
              <option value="velocidad">Velocidad máxima</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "var(--color-text-secondary)", display: "block", marginBottom: "4px" }}>
              Tiempo límite tolerable (s)
            </label>
            <input type="number" min={1} max={300} value={tiempoLimite}
              onChange={(e) => setTiempoLimite(parseFloat(e.target.value) || 1)}
              style={{ opacity: modoManual ? 0.4 : 1 }} disabled={modoManual} />
          </div>
        </div>
        {modoManual && (
          <p style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginTop: "8px" }}>
            La prioridad y el tiempo límite solo aplican al modo automático del agente.
          </p>
        )}
      </SectionCard>

      {/* ── Tabla de objetos ── */}
      {objetos.length > 0 && (
        <SectionCard>
          <SectionTitle>Objetos del problema</SectionTitle>
          <TablaObjetos objetos={objetos} seleccionados={idsSeleccionados} />
        </SectionCard>
      )}

      {/* ── Botones de acción ── */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "1rem", flexWrap: "wrap" }}>
        <Btn primary onClick={resolver} disabled={cargando || objetos.length === 0}>
          {labelBoton}
        </Btn>
      </div>

      {/* ── Status ── */}
      <StatusBar fase={fase} mensaje={mensajeFase} error={error} />

      {/* ── Decisión del agente ── */}
      {decisionAgente && (
        <div style={{ marginBottom: "1rem" }}>
          <DecisionAgente decision={decisionAgente} />
        </div>
      )}

      {/* ── Resultado ── */}
      {resultadoDP && (
        <SectionCard>
          <SectionTitle>✓ Resultado — {ETIQUETAS_ALGORITMO[decisionAgente?.algoritmoElegido] ?? "algoritmo"}</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "1rem" }}>
            {[
              { label: "Valor óptimo",     value: resultadoDP.valorOptimo },
              { label: "Peso usado / W",   value: `${resultadoDP.pesoTotal} / ${capacidad}` },
              { label: "Objetos elegidos", value: resultadoDP.objetosSeleccionados.length },
            ].map(({ label, value }) => (
              <div key={label} style={{
                background: "var(--color-background-secondary)",
                borderRadius: "var(--border-radius-md)", padding: "0.75rem 1rem",
              }}>
                <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginBottom: "4px" }}>{label}</div>
                <div style={{ fontSize: "22px", fontWeight: 500 }}>{value}</div>
              </div>
            ))}
          </div>
          <SectionTitle>Objetos seleccionados</SectionTitle>
          <TablaObjetos objetos={objetos} seleccionados={idsSeleccionados} />
        </SectionCard>
      )}

      {/* ── Panel de estadísticas ── */}
      {resultadoDP && (
        <div style={{ marginBottom: "1rem" }}>
          <PanelEstadisticas
            decision={decisionAgente}
            resultado={resultadoDP}
            objetos={objetos}
            W={capacidad}
          />
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}