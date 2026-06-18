export function resolverMochilaAvido(pesos, valores, capacidad) {

  let conteoOperaciones = 0; // contador para estadística

  // determinar la densidad = v_i / w_i
  const objetos = pesos.map((w, i) => {
    conteoOperaciones++;
    return {
      indice:   i,
      peso:     w,
      valor:    valores[i],
      densidad: valores[i] / w,  // métrica para la selección ávida
    };
  });

  // ordenar por densidad de mayor a menor
  objetos.sort((a, b) => {
    conteoOperaciones++;
    return b.densidad - a.densidad;
  });

  // se hace la selección ávida|
  let capacidadRestante   = capacidad;
  let valorTotal          = 0;
  let pesoTotal           = 0;
  const objetosSeleccionados = [];

  // recorre cada objeto
  for (const objeto of objetos) {
    conteoOperaciones++;

    // salta objetos que se pasan de la capacidad restante
    if (objeto.peso > capacidadRestante) continue;

    // toma el objeto
    objetosSeleccionados.push(objeto);
    capacidadRestante -= objeto.peso;
    valorTotal        += objeto.valor;
    pesoTotal         += objeto.peso;

    // si la mochila está exactamente llena
    if (capacidadRestante === 0) break;
  }

  // retornar resultado estructurado
  return {
    objetosSeleccionados, // objetos elegidos (en orden de selección, mayor densidad primero)
    valorTotal,           // valor total empacado
    pesoTotal,            // peso total empacado
    conteoOperaciones,    // conteo de operaciones para el panel de métricas
  };
}