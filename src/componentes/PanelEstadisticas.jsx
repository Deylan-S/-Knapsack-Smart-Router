/**
 * PanelEstadisticas.jsx
 * Panel comparativo de métricas: tiempo estimado vs real,
 * operaciones estimadas vs reales, barras comparativas y tabla DP.
 */
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";

function MetricCard({ label, value, sub }) {
  return (
    <div style={{
      background: "var(--color-background-secondary)",
      borderRadius: "var(--border-radius-md)",
      padding: "0.75rem 1rem",
    }}>
      <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginBottom: "4px" }}>{label}</div>
      <div style={{ fontSize: "22px", fontWeight: 500 }}>{value}</div>
      {sub && <div style={{ fontSize: "11px", color: "var(--color-text-tertiary)", marginTop: "2px" }}>{sub}</div>}
    </div>
  );
}

function BarraComparativa({ label, est, real, maxVal, colorEst, colorReal }) {
  return (
    <div style={{ marginBottom: "10px" }}>
      <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginBottom: "4px" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
        <span style={{ fontSize: "11px", color: "var(--color-text-tertiary)", width: "70px", flexShrink: 0 }}>Estimado</span>
        <div style={{ flex: 1, background: "var(--color-background-secondary)", borderRadius: "4px", height: "8px", overflow: "hidden" }}>
          <div style={{ width: `${est != null ? Math.min(100, (est / maxVal) * 100) : 0}%`,
            height: "100%", background: colorEst, borderRadius: "4px", transition: "width 0.6s ease" }} />
        </div>
        <span style={{ fontSize: "11px", color: "var(--color-text-secondary)", width: "80px", textAlign: "right", flexShrink: 0 }}>
          {est != null ? est : "—"}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "11px", color: "var(--color-text-tertiary)", width: "70px", flexShrink: 0 }}>Real</span>
        <div style={{ flex: 1, background: "var(--color-background-secondary)", borderRadius: "4px", height: "8px", overflow: "hidden" }}>
          <div style={{ width: `${Math.min(100, (real / maxVal) * 100)}%`,
            height: "100%", background: colorReal, borderRadius: "4px", transition: "width 0.6s ease" }} />
        </div>
        <span style={{ fontSize: "11px", color: "var(--color-text-secondary)", width: "80px", textAlign: "right", flexShrink: 0 }}>
          {real}
        </span>
      </div>
    </div>
  );
}

function TablaDPVista({ tabla, objetos, W }) {
  if (!tabla || tabla.length === 0) return null;
  const maxCol = Math.min(W, 15);
  const cols = Array.from({ length: maxCol + 1 }, (_, i) => i);
  const mostrarPuntos = W > 15;

  return (
    <div style={{ overflowX: "auto", marginTop: "0.5rem" }}>
      <table style={{ borderCollapse: "collapse", fontSize: "10px" }}>
        <thead>
          <tr>
            <th style={thStyle}>i \ w</th>
            {cols.map((c) => <th key={c} style={thStyle}>{c}</th>)}
            {mostrarPuntos && <th style={thStyle}>...</th>}
            {mostrarPuntos && <th style={thStyle}>{W}</th>}
          </tr>
        </thead>
        <tbody>
          {tabla.map((fila, i) => (
            <tr key={i}>
              <th style={thStyle}>{i === 0 ? "∅" : objetos[i - 1]?.nombre || `O${i}`}</th>
              {cols.map((c) => {
                const esOptimo = i === objetos.length && c === W;
                return (
                  <td key={c} style={{ ...tdStyle, background: esOptimo ? "#E1F5EE" : "transparent",
                    color: esOptimo ? "#0F6E56" : "var(--color-text-primary)", fontWeight: esOptimo ? 600 : 400 }}>
                    {fila[c]}
                  </td>
                );
              })}
              {mostrarPuntos && <td style={{ ...tdStyle, color: "var(--color-text-tertiary)" }}>…</td>}
              {mostrarPuntos && (
                <td style={{ ...tdStyle,
                  background: i === objetos.length ? "#E1F5EE" : "transparent",
                  color: i === objetos.length ? "#0F6E56" : "var(--color-text-primary)",
                  fontWeight: i === objetos.length ? 600 : 400,
                }}>
                  {fila[W]}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {mostrarPuntos && (
        <p style={{ fontSize: "11px", color: "var(--color-text-tertiary)", marginTop: "4px" }}>
          Mostrando columnas 0–{maxCol} y columna W={W}. La tabla completa tiene {W + 1} columnas.
        </p>
      )}
    </div>
  );
}

const thStyle = {
  border: "0.5px solid var(--color-border-tertiary)",
  padding: "3px 6px",
  background: "var(--color-background-secondary)",
  fontWeight: 500,
  color: "var(--color-text-secondary)",
  textAlign: "center",
};
const tdStyle = {
  border: "0.5px solid var(--color-border-tertiary)",
  padding: "3px 6px",
  textAlign: "center",
};

export default function PanelEstadisticas({ decision, resultado, objetos, W }) {
  if (!resultado) return null;

  const tiempoEst = decision?.tiempoEstimadoMs ?? null;
  const opsEst = decision?.operacionesEstimadas ?? null;
  const tiempoReal = resultado.tiempoMs;
  const opsReal = resultado.operaciones;

  const maxT = Math.max(tiempoEst ?? 0, tiempoReal, 0.01);
  const maxO = Math.max(opsEst ?? 0, opsReal, 1);

  // Datos para el gráfico Recharts
  const datosGrafico = [
    { nombre: "Tiempo (ms)", Estimado: tiempoEst != null ? parseFloat(tiempoEst.toFixed(4)) : 0, Real: parseFloat(tiempoReal.toFixed(4)) },
    { nombre: "Ops (×100)", Estimado: opsEst != null ? Math.round(opsEst / 100) : 0, Real: Math.round(opsReal / 100) },
  ];

  return (
    <div style={{
      background: "var(--color-background-primary)",
      border: "0.5px solid var(--color-border-tertiary)",
      borderRadius: "var(--border-radius-lg)",
      padding: "1rem 1.25rem",
    }}>
      <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--color-text-secondary)",
        textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
        Panel de estadísticas
      </p>

      {/* Métricas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", marginBottom: "1rem" }}>
        <MetricCard label="Tiempo estimado (IA)" value={tiempoEst != null ? tiempoEst.toFixed(2) : "N/A"} sub="milisegundos" />
        <MetricCard label="Tiempo real (local)" value={tiempoReal.toFixed(4)} sub="milisegundos" />
        <MetricCard label="Ops estimadas (IA)" value={opsEst != null ? opsEst.toLocaleString() : "N/A"} sub="operaciones" />
        <MetricCard label="Ops reales (local)" value={opsReal.toLocaleString()} sub="operaciones" />
      </div>

      {/* Barras comparativas */}
      <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--color-text-secondary)",
        textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>Comparativa visual</p>

      <BarraComparativa
        label="Tiempo de ejecución (ms)"
        est={tiempoEst != null ? parseFloat(tiempoEst.toFixed(4)) : null}
        real={parseFloat(tiempoReal.toFixed(4))}
        maxVal={maxT}
        colorEst="#378ADD"
        colorReal="#1D9E75"
      />
      <BarraComparativa
        label="Operaciones realizadas"
        est={opsEst}
        real={opsReal}
        maxVal={maxO}
        colorEst="#EF9F27"
        colorReal="#D4537E"
      />

      {/* Gráfico Recharts */}
      <div style={{ marginTop: "1rem", height: "200px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={datosGrafico} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" />
            <XAxis dataKey="nombre" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ fontSize: "12px" }} />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Bar dataKey="Estimado" fill="#378ADD" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Real" fill="#1D9E75" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Separador */}
      <div style={{ height: "0.5px", background: "var(--color-border-tertiary)", margin: "1rem 0" }} />

      {/* Tabla DP */}
      <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--color-text-secondary)",
        textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>
        Tabla DP{" "}
        <span style={{ fontWeight: 400, color: "var(--color-text-tertiary)", fontSize: "11px" }}>
          (filas = objetos, columnas = capacidad W)
        </span>
      </p>
      <TablaDPVista tabla={resultado.tabla} objetos={objetos} W={W} />
    </div>
  );
}