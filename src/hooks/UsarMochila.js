/**
 * usarMochila.js
 * Hook principal — ahora ejecuta los algoritmos en un Web Worker
 * para evitar que la interfaz se congele con N cercano al límite.
 */

import { useState, useCallback, useRef } from "react";
import { consultarAgente, ALGORITMOS } from "../algoritmos/agenteIA";

// Función auxiliar: ejecuta el algoritmo en el Worker y devuelve una Promise
function ejecutarEnWorker(algoritmo, objetos, capacidad) {
  return new Promise((resolve, reject) => {
    // Vite importa workers con el sufijo ?worker
    const worker = new Worker(
      new URL("../algoritmos/knapsackWorker.js", import.meta.url),
      { type: "module" }
    );

    worker.onmessage = (e) => {
      worker.terminate(); // liberar el hilo cuando termina
      if (e.data.ok) {
        resolve(e.data.resultado);
      } else {
        reject(new Error(e.data.error));
      }
    };

    worker.onerror = (e) => {
      worker.terminate();
      reject(new Error(`Error en el Worker: ${e.message}`));
    };

    worker.postMessage({ algoritmo, objetos, capacidad });
  });
}

export function usarMochila() {
  const [objetos, setObjetos] = useState([]);
  const [capacidad, setCapacidad] = useState(15);
  const [n, setN] = useState(6);
  const [prioridad, setPrioridad] = useState("exactitud");
  const [tiempoLimite, setTiempoLimite] = useState(5);
  const [apiKey, setApiKey] = useState("");
  const [algoritmoManual, setAlgoritmoManual] = useState("auto");

  const [fase, setFase] = useState("idle");
  const [mensajeFase, setMensajeFase] = useState("");
  const [error, setError] = useState(null);

  const [decisionAgente, setDecisionAgente] = useState(null);
  const [resultadoDP, setResultadoDP] = useState(null);

  const limpiarResultados = useCallback(() => {
    setDecisionAgente(null);
    setResultadoDP(null);
    setFase("idle");
    setError(null);
    setMensajeFase("");
  }, []);

  const generarAleatorio = useCallback(() => {
    const cantidad = Math.max(4, Math.min(25, n));
    const nuevos = Array.from({ length: cantidad }, (_, i) => ({
      id: i + 1,
      nombre: `Obj ${i + 1}`,
      peso: Math.floor(Math.random() * 9) + 1,
      valor: Math.floor(Math.random() * 15) + 1,
    }));
    setObjetos(nuevos);
    limpiarResultados();
  }, [n, limpiarResultados]);

  const resolver = useCallback(async () => {
    if (objetos.length === 0) {
      setError("Primero genera los objetos del problema.");
      return;
    }
    if (algoritmoManual === "auto" && !apiKey.trim()) {
      setError("Ingresa tu API Key de Gemini o seleccioná un algoritmo manual.");
      return;
    }

    limpiarResultados();

    try {
      let algoritmoAEjecutar;

      if (algoritmoManual !== "auto") {
        // ── Modo manual ──────────────────────────────────────────────────────
        algoritmoAEjecutar = algoritmoManual;
        setFase("ejecutando");
        setMensajeFase(`Ejecutando ${algoritmoManual} en hilo secundario...`);

        setDecisionAgente({
          algoritmoElegido:     algoritmoManual,
          justificacion:        "Algoritmo seleccionado manualmente. El agente de IA no fue consultado.",
          tiempoEstimadoMs:     null,
          operacionesEstimadas: null,
          advertencias:         "",
          esExacto:             algoritmoManual !== ALGORITMOS.GREEDY,
          seleccionManual:      true,
        });

      } else {
        // ── Modo automático: consultar al agente ─────────────────────────────
        setFase("consultando");
        setMensajeFase("Consultando al agente de IA...");

        const decision = await consultarAgente({
          n: objetos.length, w: capacidad, prioridad, tiempoLimite, apiKey,
        });
        setDecisionAgente(decision);
        algoritmoAEjecutar = decision.algoritmoElegido;

        setFase("ejecutando");
        setMensajeFase(`Ejecutando ${algoritmoAEjecutar} en hilo secundario...`);
      }

      // ── Ejecución en Web Worker (hilo secundario) ────────────────────────
      // La interfaz permanece fluida mientras el Worker trabaja en paralelo
      const resultado = await ejecutarEnWorker(algoritmoAEjecutar, objetos, capacidad);

      setResultadoDP(resultado);
      setFase("listo");
      setMensajeFase("¡Solución encontrada!");

    } catch (e) {
      setFase("error");
      setError(e.message);
    }
  }, [objetos, capacidad, prioridad, tiempoLimite, apiKey, algoritmoManual, limpiarResultados]);

  const soloDP = useCallback(async () => {
    if (objetos.length === 0) { setError("Primero genera los objetos."); return; }
    limpiarResultados();
    setFase("ejecutando");
    setMensajeFase("Ejecutando Programación Dinámica en hilo secundario...");
    try {
      const resultado = await ejecutarEnWorker(ALGORITMOS.PROGRAMACION_DINAMICA, objetos, capacidad);
      setResultadoDP(resultado);
      setFase("listo");
      setMensajeFase("¡DP completada!");
    } catch (e) {
      setFase("error");
      setError(e.message);
    }
  }, [objetos, capacidad, limpiarResultados]);

  return {
    objetos, setObjetos, capacidad, setCapacidad,
    n, setN, prioridad, setPrioridad,
    tiempoLimite, setTiempoLimite, apiKey, setApiKey,
    algoritmoManual, setAlgoritmoManual,
    fase, mensajeFase, error,
    decisionAgente, resultadoDP,
    generarAleatorio, resolver, soloDP, limpiarResultados,
  };
}