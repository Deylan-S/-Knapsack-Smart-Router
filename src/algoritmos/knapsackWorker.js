/**
 * knapsackWorker.js
 * Web Worker — ejecuta los algoritmos del Knapsack en un hilo secundario.
 * Esto evita que la interfaz de React se congele durante cómputos pesados.
 *
 * Comunicación con el hilo principal:
 *   Recibe:  { algoritmo, objetos, capacidad }
 *   Envía:   { ok: true, resultado } | { ok: false, error }
 */

// ── Programación Dinámica ────────────────────────────────────────────────────
function resolverMochilaPD(objetos, capacidad) {
  const inicio = performance.now();
  let operaciones = 0;
  const n = objetos.length;
  const W = Math.floor(capacidad);

  if (n === 0 || W <= 0) {
    return { valorOptimo: 0, pesoTotal: 0, objetosSeleccionados: [], operaciones: 0, tiempoMs: 0, tabla: [] };
  }

  const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const peso = Math.floor(objetos[i - 1].peso);
    const valor = objetos[i - 1].valor;
    for (let w = 0; w <= W; w++) {
      operaciones++;
      dp[i][w] = dp[i - 1][w];
      if (peso <= w) {
        const c = dp[i - 1][w - peso] + valor;
        if (c > dp[i][w]) dp[i][w] = c;
      }
    }
  }

  const sel = [];
  let w = W;
  for (let i = n; i >= 1; i--) {
    operaciones++;
    if (dp[i][w] !== dp[i - 1][w]) {
      sel.push(objetos[i - 1].id);
      w -= Math.floor(objetos[i - 1].peso);
    }
  }

  const pesoTotal = objetos.filter(o => sel.includes(o.id)).reduce((a, o) => a + o.peso, 0);

  return {
    valorOptimo: dp[n][W],
    pesoTotal,
    objetosSeleccionados: sel,
    operaciones,
    tiempoMs: parseFloat((performance.now() - inicio).toFixed(4)),
    tabla: dp,
  };
}

// ── Backtracking ─────────────────────────────────────────────────────────────
function resolverMochilaBacktracking(objetos, capacidad) {
  const inicio = performance.now();
  let operaciones = 0;
  let mejorValor = 0;
  let mejorSeleccion = [];

  function bt(i, pesoActual, valorActual, seleccion) {
    operaciones++;
    if (i === objetos.length) {
      if (valorActual > mejorValor) {
        mejorValor = valorActual;
        mejorSeleccion = [...seleccion];
      }
      return;
    }
    // No incluir objeto i
    bt(i + 1, pesoActual, valorActual, seleccion);
    // Incluir objeto i (si cabe)
    if (pesoActual + objetos[i].peso <= capacidad) {
      seleccion.push(objetos[i].id);
      bt(i + 1, pesoActual + objetos[i].peso, valorActual + objetos[i].valor, seleccion);
      seleccion.pop();
    }
  }

  bt(0, 0, 0, []);
  const pesoTotal = objetos.filter(o => mejorSeleccion.includes(o.id)).reduce((a, o) => a + o.peso, 0);

  return {
    valorOptimo: mejorValor,
    pesoTotal,
    objetosSeleccionados: mejorSeleccion,
    operaciones,
    tiempoMs: parseFloat((performance.now() - inicio).toFixed(4)),
    tabla: [],
  };
}

// ── Greedy ───────────────────────────────────────────────────────────────────
function resolverMochilaGreedy(objetos, capacidad) {
  const inicio = performance.now();
  let operaciones = 0;

  const ordenados = [...objetos]
    .map(o => ({ ...o, densidad: o.valor / o.peso }))
    .sort((a, b) => { operaciones++; return b.densidad - a.densidad; });

  const seleccionados = [];
  let pesoActual = 0;
  let valorActual = 0;

  for (const o of ordenados) {
    operaciones++;
    if (pesoActual + o.peso <= capacidad) {
      seleccionados.push(o.id);
      pesoActual += o.peso;
      valorActual += o.valor;
    }
  }

  return {
    valorOptimo: valorActual,
    pesoTotal: pesoActual,
    objetosSeleccionados: seleccionados,
    operaciones,
    tiempoMs: parseFloat((performance.now() - inicio).toFixed(4)),
    tabla: [],
  };
}

// ── Listener principal ───────────────────────────────────────────────────────
self.onmessage = function (e) {
  const { algoritmo, objetos, capacidad } = e.data;

  try {
    let resultado;

    switch (algoritmo) {
      case "programacion_dinamica":
        resultado = resolverMochilaPD(objetos, capacidad);
        break;
      case "backtracking":
        resultado = resolverMochilaBacktracking(objetos, capacidad);
        break;
      case "greedy":
        resultado = resolverMochilaGreedy(objetos, capacidad);
        break;
      default:
        throw new Error(`Algoritmo desconocido: ${algoritmo}`);
    }

    self.postMessage({ ok: true, resultado });
  } catch (err) {
    self.postMessage({ ok: false, error: err.message });
  }
};