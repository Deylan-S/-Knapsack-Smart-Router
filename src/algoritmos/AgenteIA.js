/**
 * agenteIA.js
 * Integración con Gemini API para el Agente Inteligente de Enrutamiento.
 * Usa Structured Outputs (responseMimeType: application/json).
 *
 * Respuesta del agente:
 *   { algoritmoElegido, justificacion, tiempoEstimadoMs,
 *     operacionesEstimadas, advertencias, esExacto }
 */

export const ALGORITMOS = {
  BACKTRACKING: "backtracking",
  PROGRAMACION_DINAMICA: "programacion_dinamica",
  GREEDY: "greedy",
};

const MODELO = "gemini-2.0-flash";
const URL_API = (key) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent?key=${key}`;

// System Prompt

function construirSystemPrompt() {
  return `
Eres un agente experto en análisis de algoritmos para el Problema de la Mochila (0/1 Knapsack).
Tu única tarea es analizar los metadatos de un problema y decidir cuál de los tres algoritmos
disponibles es el más adecuado, justificando tu decisión con rigor técnico.

## Algoritmos disponibles

### 1. backtracking
- Complejidad temporal: O(2^N) — exponencial.
- Complejidad espacial: O(N) pila de recursión.
- Garantía: solución exacta y óptima siempre.
- Viable solo si N ≤ 15. Con N > 20, el tiempo supera varios segundos en el navegador.

### 2. programacion_dinamica
- Complejidad temporal: O(N × W) — pseudo-polinomial.
- Complejidad espacial: O(N × W).
- Garantía: solución exacta y óptima siempre.
- Viable si N ≤ 25 y W ≤ 100000. Con W masivo el consumo de memoria es prohibitivo.

### 3. greedy
- Complejidad temporal: O(N log N).
- Complejidad espacial: O(N).
- Sin garantía de óptimo global. Es una aproximación heurística por densidad de valor (v/p).
- Prácticamente instantáneo en cualquier escenario.

## Reglas de decisión (aplicar en orden)

1. Si prioridad = "velocidad" → elige greedy siempre.
2. Si prioridad = "exactitud":
   a. N ≤ 15 → elige backtracking.
   b. N > 15 y W ≤ 100000 → elige programacion_dinamica.
   c. N > 15 y W > 100000 → elige greedy (advierte que la solución es aproximada).
3. Si el tiempo estimado del algoritmo exacto supera el tiempo límite del usuario,
   degrada al siguiente más rápido.

## Estimaciones de tiempo orientativas

- Backtracking: 2^N / 10000000 segundos.
- Programación Dinámica: (N × W) / 50000000 segundos.
- Greedy: siempre < 5 ms.

## Formato de respuesta OBLIGATORIO

Responde ÚNICAMENTE con un objeto JSON válido. Sin texto adicional, sin bloques markdown.

{
  "algoritmoElegido": "backtracking" | "programacion_dinamica" | "greedy",
  "justificacion": "Explicación técnica clara mencionando complejidades, N, W y restricciones.",
  "tiempoEstimadoMs": <número en milisegundos>,
  "operacionesEstimadas": <número entero>,
  "advertencias": "<advertencia relevante o cadena vacía>",
  "esExacto": true | false
}
  `.trim();
}

//Función principal

/**
 * Consulta al Agente de IA para que elija el algoritmo óptimo.
 *
 * @param {{ n, w, prioridad, tiempoLimite, apiKey }} params
 * @returns {Promise<{ algoritmoElegido, justificacion, tiempoEstimadoMs,
 *                     operacionesEstimadas, advertencias, esExacto }>}
 */
export async function consultarAgente({ n, w, prioridad, tiempoLimite, apiKey }) {
  if (!apiKey?.trim()) {
    throw new Error("Se requiere un API Key válido para consultar al agente.");
  }

  const mensajeUsuario = `
Analiza este problema de la mochila y elige el algoritmo óptimo:

- Cantidad de objetos (N): ${n}
- Capacidad de la mochila (W): ${w}
- Prioridad del usuario: ${prioridad === "velocidad" ? "Velocidad Máxima (acepta aproximaciones)" : "Máxima Exactitud (sin importar el tiempo)"}
- Tiempo límite tolerable: ${tiempoLimite} segundos

Responde ÚNICAMENTE con el objeto JSON especificado.
  `.trim();

  const cuerpo = {
    system_instruction: {
      parts: [{ text: construirSystemPrompt() }],
    },
    contents: [
      { role: "user", parts: [{ text: mensajeUsuario }] },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1,
    },
  };

  let respuesta;
  try {
    respuesta = await fetch(URL_API(apiKey), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo),
    });
  } catch (e) {
    throw new Error(`Error de red al contactar Gemini: ${e.message}`);
  }

  if (!respuesta.ok) {
    const texto = await respuesta.text();
    throw new Error(`Gemini respondió con error ${respuesta.status}: ${texto.slice(0, 300)}`);
  }

  const datos = await respuesta.json();
  const raw = datos?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!raw) {
    throw new Error("La API de Gemini no devolvió contenido.");
  }

  let decision;
  try {
    decision = JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch {
    throw new Error(`Respuesta del agente no es JSON válido: ${raw}`);
  }

  validarDecision(decision);
  return decision;
}

function validarDecision(d) {
  const campos = ["algoritmoElegido", "justificacion", "tiempoEstimadoMs",
                  "operacionesEstimadas", "advertencias", "esExacto"];
  for (const c of campos) {
    if (!(c in d)) throw new Error(`Campo faltante en respuesta del agente: "${c}"`);
  }
  const validos = Object.values(ALGORITMOS);
  if (!validos.includes(d.algoritmoElegido)) {
    throw new Error(`Algoritmo desconocido en respuesta: "${d.algoritmoElegido}"`);
  }
}