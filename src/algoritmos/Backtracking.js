export const resolverMochilaBacktracking = (items, capacidadMaxima) => {
  const inicioTiempo = performance.now();

  let operaciones = 0;
  let mejorValor = 0;
  let mejorCombinacion = [];

  // función recursiva
  const explorar = (
    indiceActual,
    pesoActual,
    valorActual,
    seleccionadosActuales,
  ) => {
    operaciones++; // contar las llamadas

    // condición de parada
    if (indiceActual === items.length) {
      if (valorActual > mejorValor) {
        mejorValor = valorActual;
        mejorCombinacion = [...seleccionadosActuales];
      }
      return;
    }

    const itemActual = items[indiceActual];

    // no inlcuye el item actual y avanzar al siguiente
    explorar(indiceActual + 1, pesoActual, valorActual, seleccionadosActuales);

    // incluye el item actual (solo si no se pasa la capacidad)
    if (pesoActual + itemActual.peso <= capacidadMaxima) {
      seleccionadosActuales.push(itemActual);

      explorar(
        indiceActual + 1,
        pesoActual + itemActual.peso,
        valorActual + itemActual.valor,
        seleccionadosActuales,
      );

      // backtrack, deshace la selección para explorar otras ramas
      seleccionadosActuales.pop();
    }
  };

  // ejecuta la recursividad iniciando desde el índice 0
  explorar(0, 0, 0, []);

  // finaliza medición del tiempo
  const finTiempo = performance.now();

  // retorna el objeto estructurado
  return {
    valorMaximo: mejorValor,
    itemsSeleccionados: mejorCombinacion,
    tiempoEjecucion: finTiempo - inicioTiempo,
    llamadasRecursivas: operaciones,
  };
};

// código de prueba
const valoresPrueba = [
  { id: 1, peso: 10, valor: 60 },
  { id: 2, peso: 20, valor: 100 },
  { id: 3, peso: 30, valor: 120 },
  { id: 4, peso: 15, valor: 50 },
];

const capacidadPrueba = 50;

const resultado = resolverMochilaBacktracking(valoresPrueba, capacidadPrueba);

console.dir(resultado, { depth: null, colors: true });
