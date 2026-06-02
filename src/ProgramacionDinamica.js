/**
 *
 * Formato de entrada esperado:
 *   objetos: Array de { id, nombre, peso, valor }
 *   capacidad: número entero positivo (W)
 *
 * Formato de salida:
 *   {
 *     valorOptimo: number,
 *     pesoTotal: number,
 *     objetosSeleccionados: Array de ids,
 *     operaciones: number,
 *     tiempoMs: number,
 *     tabla: Array<Array<number>>  // tabla DP completa (para visualización opcional)
 *   }
 */

/**
 * Resuelve el problema de la mochila usando Programación Dinámica (bottom-up).
 * @param {Array<{id: number, nombre: string, peso: number, valor: number}>} objetos
 * @param {number} capacidad - Capacidad máxima W de la mochila
 * @returns {Object} Resultado con valor óptimo, objetos seleccionados y métricas
 */
export function resolverMochilaPD(objetos, capacidad) {
  const inicio = performance.now();
  let operaciones = 0;

  const n = objetos.length;
  const W = Math.floor(capacidad);

  
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


  // dp[i][w] = valor máximo usando los primeros i objetos con capacidad w
  // Dimensiones: (n+1) filas x (W+1) columnas
  const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const objeto = objetos[i - 1];
    const peso = Math.floor(objeto.peso);
    const valor = objeto.valor;

    for (let w = 0; w <= W; w++) {
      operaciones++;

      
      dp[i][w] = dp[i - 1][w];

      
      if (peso <= w) {
        const conObjeto = dp[i - 1][w - peso] + valor;
        if (conObjeto > dp[i][w]) {
          dp[i][w] = conObjeto;
        }
      }
    }
  }

  // Recorremos la tabla al revés para saber qué objetos fueron incluidos
  const objetosSeleccionados = [];
  let w = W;

  for (let i = n; i >= 1; i--) {
    operaciones++;
    // Si el valor cambió respecto a la fila anterior, el objeto i fue incluido
    if (dp[i][w] !== dp[i - 1][w]) {
      objetosSeleccionados.push(objetos[i - 1].id);
      w -= Math.floor(objetos[i - 1].peso);
    }
  }

  // Calculamos el peso total de los objetos seleccionados
  const pesoTotal = objetos
    .filter((obj) => objetosSeleccionados.includes(obj.id))
    .reduce((acc, obj) => acc + obj.peso, 0);

  const fin = performance.now();

  return {
    valorOptimo: dp[n][W],
    pesoTotal,
    objetosSeleccionados,          // Array de ids seleccionados
    operaciones,
    tiempoMs: parseFloat((fin - inicio).toFixed(4)),
    tabla: dp,                     
  };
}

/**
 * No retorna la tabla completa ni permite reconstrucción exacta de objetos,
 * pero es útil si W es muy grande y solo se necesita el valor óptimo.
 *
 * @param {Array<{id: number, peso: number, valor: number}>} objetos
 * @param {number} capacidad
 * @returns {{ valorOptimo: number, operaciones: number, tiempoMs: number }}
 */
export function resolverMochilaPD_OptimizadoEspacio(objetos, capacidad) {
  const inicio = performance.now();
  let operaciones = 0;

  const n = objetos.length;
  const W = Math.floor(capacidad);

  // Una sola fila que se va actualizando
  const dp = new Array(W + 1).fill(0);

  for (let i = 0; i < n; i++) {
    const peso = Math.floor(objetos[i].peso);
    const valor = objetos[i].valor;

    // Recorremos de derecha a izquierda para evitar usar el mismo objeto dos veces
    for (let w = W; w >= peso; w--) {
      operaciones++;
      const conObjeto = dp[w - peso] + valor;
      if (conObjeto > dp[w]) {
        dp[w] = conObjeto;
      }
    }
  }

  const fin = performance.now();

  return {
    valorOptimo: dp[W],
    operaciones,
    tiempoMs: parseFloat((fin - inicio).toFixed(4)),
  };
}