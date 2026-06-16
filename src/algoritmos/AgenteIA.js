/**
 * agenteIA.js
 * Integración con Gemini API usando el SDK oficial @google/genai.
 * Usa Structured Outputs (responseSchema) para garantizar JSON parseable.
 *
 * Requiere: npm install @google/genai
 *
 * Respuesta del agente:
 *   { algoritmoElegido, justificacion, tiempoEstimadoMs,
 *     operacionesEstimadas, advertencias, esExacto }
 */

import { GoogleGenAI, Type } from "@google/genai";

export const ALGORITMOS = {
  BACKTRACKING: "backtracking",
  PROGRAMACION_DINAMICA: "programacion_dinamica",
  GREEDY: "greedy",
};

const MODELO = "gemini-2.5-flash-lite";

// ── Esquema de respuesta estructurada
// Define exactamente la forma que debe tener la respuesta del agente.
const ESQUEMA_RESPUESTA = {
  type: Type.OBJECT,
  properties: {
    algoritmoElegido: {
      type: Type.STRING,
      enum: [ALGORITMOS.BACKTRACKING, ALGORITMOS.PROGRAMACION_DINAMICA, ALGORITMOS.GREEDY],
      description: "El algoritmo que el agente considera óptimo para este problema.",
    },
    justificacion: {
      type: Type.STRING,
      description: "Explicación técnica de la decisión, mencionando complejidades, N, W y restricciones.",
    },
    tiempoEstimadoMs: {
      type: Type.NUMBER,
      description: "Estimación del tiempo de ejecución en milisegundos.",
    },
    operacionesEstimadas: {
      type: Type.INTEGER,
      description: "Estimación del número de operaciones que realizará el algoritmo.",
    },
    advertencias: {
      type: Type.STRING,
      description: "Advertencia relevante para el usuario, o cadena vacía si no hay ninguna.",
    },
    esExacto: {
      type: Type.BOOLEAN,
      description: "Indica si el algoritmo elegido garantiza la solución óptima exacta.",
    },
  },
  required: ["algoritmoElegido", "justificacion", "tiempoEstimadoMs", "operacionesEstimadas", "advertencias", "esExacto"],
};

// ── System Prompt 

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

Debes completar todos los campos del esquema de respuesta proporcionado.
  `.trim();
}

// ── Función principal

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
  `.trim();

  let respuesta;
  try {
    const ai = new GoogleGenAI({ apiKey });

    respuesta = await ai.models.generateContent({
      model: MODELO,
      contents: mensajeUsuario,
      config: {
        systemInstruction: construirSystemPrompt(),
        responseMimeType: "application/json",
        responseSchema: ESQUEMA_RESPUESTA,
        temperature: 0.1,
      },
    });
  } catch (e) {
    throw new Error(`Error al contactar al Agente de IA: ${e.message}`, { cause: e });
  }

  const raw = respuesta?.text;
  if (!raw) {
    throw new Error("La API de Gemini no devolvió contenido.");
  }

  let decision;
  try {
    decision = JSON.parse(raw);
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