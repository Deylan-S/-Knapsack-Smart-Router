/**
 * TablaObjetos.jsx
 * Tabla y chips visuales de los objetos del problema.
 */
export default function TablaObjetos({ objetos, seleccionados = [] }) {
  if (!objetos || objetos.length === 0) return null;

  return (
    <div>
      <div style={{ overflowX: "auto", marginBottom: "0.75rem" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
              {["ID","Nombre","Peso","Valor","Densidad (v/p)"].map((h) => (
                <th key={h} style={{ padding: "6px 10px", textAlign: h === "ID" || h === "Nombre" ? "left" : "right",
                  color: "var(--color-text-secondary)", fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {objetos.map((o) => {
              const sel = seleccionados.includes(o.id);
              return (
                <tr key={o.id} style={{
                  borderBottom: "0.5px solid var(--color-border-tertiary)",
                  background: sel ? "#E1F5EE" : "transparent",
                }}>
                  <td style={{ padding: "6px 10px" }}>{o.id}</td>
                  <td style={{ padding: "6px 10px", fontWeight: sel ? 500 : 400,
                    color: sel ? "#0F6E56" : "var(--color-text-primary)" }}>{o.nombre}</td>
                  <td style={{ padding: "6px 10px", textAlign: "right" }}>{o.peso}</td>
                  <td style={{ padding: "6px 10px", textAlign: "right" }}>{o.valor}</td>
                  <td style={{ padding: "6px 10px", textAlign: "right" }}>{(o.valor / o.peso).toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "8px" }}>
        {objetos.map((o) => {
          const sel = seleccionados.includes(o.id);
          return (
            <div key={o.id} style={{
              border: `0.5px solid ${sel ? "#1D9E75" : "var(--color-border-tertiary)"}`,
              borderRadius: "var(--border-radius-md)",
              padding: "8px",
              textAlign: "center",
              background: sel ? "#E1F5EE" : "var(--color-background-primary)",
              position: "relative",
              transition: "all 0.2s",
            }}>
              {sel && (
                <span style={{ position: "absolute", top: 4, right: 6, color: "#1D9E75", fontSize: "11px", fontWeight: 600 }}>✓</span>
              )}
              <div style={{ fontSize: "11px", fontWeight: 500, color: sel ? "#0F6E56" : "var(--color-text-primary)", marginBottom: 2 }}>{o.nombre}</div>
              <div style={{ fontSize: "10px", color: "var(--color-text-secondary)" }}>p:{o.peso} v:{o.valor}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}