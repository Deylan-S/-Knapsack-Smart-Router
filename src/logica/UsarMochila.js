/**
 * usarMochila.js
 */

import { useState, useCallback } from "react";
import { resolverMochilaPD } from "../algoritmos/programacionDinamica";
import { consultarAgente, ALGORITMOS } from "../algoritmos/agenteIA";

// Cambiar cuando los modulos esten listos:
// import { resolverMochilaBacktracking } from "../src/algoritmos/backtracking";
// import { resolverMochilaGreedy } from "../src/algoritmos/greedy";

export function usarMochila() {
  const [objetos, setObjetos] = useState([]);
  const [capacidad, setCapacidad] = useState(15);
  const [n, setN] = useState(6);
  const [prioridad, setPrioridad] = useState("exactitud");
  const [tiempoLimite, setTiempoLimite] = useState(5);
  const [apiKey, setApiKey] = useState("");

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

  function ejecutarAlgoritmo(algoritmo, objs, cap) {
    switch (algoritmo) {
      case ALGORITMOS.PROGRAMACION_DINAMICA:
        return resolverMochilaPD(objs, cap);
      case ALGORITMOS.BACKTRACKING:
        // return resolverMochilaBacktracking(objs, cap);
        throw new Error("Módulo de Backtracking pendiente de integrar.");
      case ALGORITMOS.GREEDY:
        // return resolverMochilaGreedy(objs, cap);
        throw new Error("Módulo de Greedy pendiente de integrar.");
      default:
        throw new Error(`Algoritmo desconocido: ${algoritmo}`);
    }
  }

  const resolver = useCallback(async () => {
    if (objetos.length === 0) { setError("Primero genera los objetos del problema."); return; }
    if (!apiKey.trim()) { setError("Ingresa tu API Key de Gemini."); return; }
    limpiarResultados();
    try {
      setFase("consultando");
      setMensajeFase("Consultando al agente de IA...");
      const decision = await consultarAgente({ n: objetos.length, w: capacidad, prioridad, tiempoLimite, apiKey });
      setDecisionAgente(decision);

      setFase("ejecutando");
      setMensajeFase(`Ejecutando ${decision.algoritmoElegido} localmente...`);
      await new Promise((r) => setTimeout(r, 150));

      const resultado = ejecutarAlgoritmo(decision.algoritmoElegido, objetos, capacidad);
      setResultadoDP(resultado);
      setFase("listo");
      setMensajeFase("¡Solución encontrada!");
    } catch (e) {
      setFase("error");
      setError(e.message);
    }
  }, [objetos, capacidad, prioridad, tiempoLimite, apiKey, limpiarResultados]);

  const soloDP = useCallback(async () => {
    if (objetos.length === 0) { setError("Primero genera los objetos."); return; }
    limpiarResultados();
    setFase("ejecutando");
    setMensajeFase("Ejecutando Programación Dinámica localmente...");
    await new Promise((r) => setTimeout(r, 100));
    try {
      const resultado = resolverMochilaPD(objetos, capacidad);
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
    fase, mensajeFase, error,
    decisionAgente, resultadoDP,
    generarAleatorio, resolver, soloDP, limpiarResultados,
  };
}