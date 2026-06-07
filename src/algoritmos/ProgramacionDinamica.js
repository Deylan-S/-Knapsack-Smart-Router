/**
 * Resuelve el Problema de la Mochila con Programación Dinámica.
 * Complejidad: O(N x W) tiempo, O(N x W) espacio.
 *
 * Formato de entrada:
 *   objetos: Array<{ id, nombre, peso, valor }>
 *   capacidad: number
 *
 * Formato de salida:
 *   { valorOptimo, pesoTotal, objetosSeleccionados, operaciones, tiempoMs, tabla }
 */

export function resolverMochilaPD(objetos, capacidad) {
  const inicio = performance.now();
  let operaciones = 0;

  const n = objetos.length;
  const W = Math.floor(capacidad);

  // Casos base
  if (n === 0 || W <= 0) {
    return {
      valorOptimo: 0,
      pesoTotal: 0,
      objetosSeleccionados: [],
      operaciones: 0,
      tiempoMs: 0,
      tabla: [],
    };
  }

  const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const peso = Math.floor(objetos[i - 1].peso);
    const valor = objetos[i - 1].valor;

    for (let w = 0; w <= W; w++) {
      operaciones++;

      // No incluir objeto i
      dp[i][w] = dp[i - 1][w];

      // Incluir objeto i si cabe
      if (peso <= w) {
        const conObjeto = dp[i - 1][w - peso] + valor;
        if (conObjeto > dp[i][w]) {
          dp[i][w] = conObjeto;
        }
      }
    }
  }

  // Reconstrucción
  const objetosSeleccionados = [];
  let w = W;
  for (let i = n; i >= 1; i--) {
    operaciones++;
    if (dp[i][w] !== dp[i - 1][w]) {
      objetosSeleccionados.push(objetos[i - 1].id);
      w -= Math.floor(objetos[i - 1].peso);
    }
  }

  const pesoTotal = objetos
    .filter((o) => objetosSeleccionados.includes(o.id))
    .reduce((acc, o) => acc + o.peso, 0);

  const fin = performance.now();

  return {
    valorOptimo: dp[n][W],
    pesoTotal,
    objetosSeleccionados,
    operaciones,
    tiempoMs: parseFloat((fin - inicio).toFixed(4)),
    tabla: dp,
  };
}