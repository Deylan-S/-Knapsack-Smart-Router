/**
 * DecisionAgente.jsx
 * Muestra la decisión del agente de IA: algoritmo elegido,
 * justificación, exactitud y advertencias.
 */

// Mapea las claves internas del agente a nombres legibles para el usuario.
const LABELS = {
  backtracking: "Backtracking",
  programacion_dinamica: "Programación Dinámica",
  greedy: "Greedy / Heurística",
};

export default function DecisionAgente({ decision }) {
  if (!decision) return null;

  return (
    <div style={{
      background: "var(--color-background-primary)",
      border: "0.5px solid var(--color-border-tertiary)",
      borderRadius: "var(--border-radius-lg)",
      padding: "1rem 1.25rem",
    }}>
      <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--color-text-secondary)",
        textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
        Decisión del agente de IA
      </p>

      {/* Algoritmo elegido + indicador de exactitud */}
      <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap" }}>
        <span style={{
          display: "inline-block", fontSize: "12px", padding: "4px 10px",
          borderRadius: "var(--border-radius-md)", fontWeight: 500,
          background: "var(--color-background-info)", color: "var(--color-text-info)",
        }}>
          {LABELS[decision.algoritmoElegido] || decision.algoritmoElegido}
        </span>
        <span style={{
          display: "inline-block", fontSize: "12px", padding: "4px 10px",
          borderRadius: "var(--border-radius-md)", fontWeight: 500,
          background: decision.esExacto ? "var(--color-background-success)" : "var(--color-background-warning)",
          color: decision.esExacto ? "var(--color-text-success)" : "var(--color-text-warning)",
        }}>
          {decision.esExacto ? " Exacto" : "⚠ Aproximado"}
        </span>
      </div>

      {/* Justificación */}
      <div style={{
        background: "var(--color-background-secondary)",
        borderLeft: "3px solid #1D9E75",
        borderRadius: "0 var(--border-radius-md) var(--border-radius-md) 0",
        padding: "0.75rem 1rem",
        fontSize: "13px",
        lineHeight: 1.6,
        color: "var(--color-text-secondary)",
        marginBottom: decision.advertencias ? "0.75rem" : 0,
      }}>
        {decision.justificacion}
      </div>

      {/* Advertencias — solo se renderiza si el agente devolvió alguna */}
      {decision.advertencias && decision.advertencias.trim() !== "" && (
        <div style={{
          background: "var(--color-background-warning)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-md)",
          padding: "0.6rem 1rem",
          fontSize: "12px",
          color: "var(--color-text-warning)",
          marginTop: "0.75rem",
        }}>
          ⚠ {decision.advertencias}
        </div>
      )}
    </div>
  );
}