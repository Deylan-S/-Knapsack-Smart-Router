/**
 * usarMochila.js
 */

import { useState, useCallback } from "react";
import { resolverMochilaPD } from "../algoritmos/programacionDinamica";
import { consultarAgente, ALGORITMOS } from "../algoritmos/agenteIA";
import { resolverMochilaBacktracking } from "../algoritmos/Backtracking";
import { resolverMochilaAvido } from "../algoritmos/Greedy";

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

  function normalizarResultado(raw, algoritmo, objs, cap) {
    switch (algoritmo) {

      case ALGORITMOS.PROGRAMACION_DINAMICA:
        return raw;

      case ALGORITMOS.BACKTRACKING:
        return {
          valorOptimo:          raw.valorMaximo,
          pesoTotal:            raw.itemsSeleccionados.reduce((s, o) => s + o.peso, 0),
          objetosSeleccionados: raw.itemsSeleccionados.map((o) => o.id), // normalizar a IDs
          operaciones:          raw.llamadasRecursivas,
          tiempoMs:             parseFloat(raw.tiempoEjecucion.toFixed(4)),
          tabla:                [],
        };

      case ALGORITMOS.GREEDY: {
        const inicio  = performance.now();
        const pesos   = objs.map((o) => o.peso);
        const valores = objs.map((o) => o.valor);
        const greedy  = resolverMochilaAvido(pesos, valores, cap);
        const fin     = performance.now();

        return {
          valorOptimo:          greedy.valorTotal,
          pesoTotal:            greedy.pesoTotal,
          objetosSeleccionados: greedy.objetosSeleccionados.map((item) => objs[item.indice].id), // normalizar a IDs
          operaciones:          greedy.conteoOperaciones,
          tiempoMs:             parseFloat((fin - inicio).toFixed(4)),
          tabla:                [],
        };
      }

      default:
        throw new Error(`Algoritmo desconocido: ${algoritmo}`);
    }
  }

  function ejecutarAlgoritmo(algoritmo, objs, cap) {
    switch (algoritmo) {
      case ALGORITMOS.PROGRAMACION_DINAMICA:
        return normalizarResultado(resolverMochilaPD(objs, cap), algoritmo, objs, cap);

      case ALGORITMOS.BACKTRACKING:
        return normalizarResultado(resolverMochilaBacktracking(objs, cap), algoritmo, objs, cap);

      case ALGORITMOS.GREEDY:
        return normalizarResultado(null, algoritmo, objs, cap);

      default:
        throw new Error(`Algoritmo desconocido: ${algoritmo}`);
    }
  }

  const resolver = useCallback(async () => {
    if (objetos.length === 0) { setError("Primero genera los objetos del problema."); return; }

    if (algoritmoManual === "auto" && !apiKey.trim()) {
      setError("Ingresa tu API Key de Gemini o seleccioná un algoritmo manual.");
      return;
    }

    limpiarResultados();

    try {
      let algoritmoAEjecutar;

      if (algoritmoManual !== "auto") {
        algoritmoAEjecutar = algoritmoManual;

        setFase("ejecutando");
        setMensajeFase(`Ejecutando ${algoritmoManual} manualmente...`);
        await new Promise((r) => setTimeout(r, 150));

        setDecisionAgente({
          algoritmoElegido:      algoritmoManual,
          justificacion:         `Algoritmo seleccionado manualmente por el profesor. El agente de IA no fue consultado.`,
          tiempoEstimadoMs:      null,
          operacionesEstimadas:  null,
          advertencias:          "",
          esExacto:              algoritmoManual !== ALGORITMOS.GREEDY,
          seleccionManual:       true,
        });

      } else {
        setFase("consultando");
        setMensajeFase("Consultando al agente de IA...");

        const decision = await consultarAgente({
          n: objetos.length, w: capacidad, prioridad, tiempoLimite, apiKey,
        });
        setDecisionAgente(decision);

        algoritmoAEjecutar = decision.algoritmoElegido;

        setFase("ejecutando");
        setMensajeFase(`Ejecutando ${algoritmoAEjecutar} localmente...`);
        await new Promise((r) => setTimeout(r, 150));
      }

      const resultado = ejecutarAlgoritmo(algoritmoAEjecutar, objetos, capacidad);
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
    setMensajeFase("Ejecutando Programación Dinámica localmente...");
    await new Promise((r) => setTimeout(r, 100));

    try {
      const resultado = ejecutarAlgoritmo(ALGORITMOS.PROGRAMACION_DINAMICA, objetos, capacidad);
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