import { useLocation } from 'react-router-dom';
import './Iterations-page.css';
//import Fraction from 'fraction.js';

export function BasicSimplex() {
    
    const location = useLocation();
    const matrix = location.state.matrix;
    const variables = location.state.variables;
    const SAvariables = location.state.SAvariables;

    const handleButtonClick = () => {
        console.log(matrix);
        console.log("labels", SAvariables);
        let labels, bvsLabels = tableLabels();
        console.log(labels);
        console.log("Estos son los verticales",bvsLabels);



        //const resultado = resolverSimplex(matrix);
        //console.log("Resultado:");
        //console.log(mostrarMatriz(resultado))
        //mostrarMatriz(resultado);
    }

    // Función para calcular los radios y encontrar el radio mínimo
    const calcularRadiosYMinimo = (matriz) => {
        const valorEntrante = encontrarValorMasNegativo(matriz[0]); // Encuentra el valor más negativo en la fila de la función objetivo
        const radios = [];
        matriz.slice(1).forEach((fila) => { // Comenzamos desde la segunda fila
        const valorFilaEntrante = fila[matriz[0].indexOf(valorEntrante)]; // Obtenemos el valor de la fila correspondiente al valor entrante
        if (valorFilaEntrante !== 0) {
            const radio = fila[fila.length - 1] / valorFilaEntrante;
            if (valorFilaEntrante < 0 || radio < 0) {
            radios.push(Infinity); // Si el valor por el cual se va a hacer la división es negativo, el resultado es infinito
            } else {
            radios.push(radio); // Calculamos el radio
            }
        } else {
            radios.push(Infinity);
        }
        });
    
        // Encontrar el radio mínimo y su índice
        let minimo = Infinity;
        let indiceMinimo = -1;
        radios.forEach((radio, indice) => {
        if (radio < minimo) {
            minimo = radio;
            indiceMinimo = indice;
        }
        });
    
        return { minimo, indiceMinimo };
    };
    
    // Función para hacer que el pivote sea igual a 1 y establecer los demás números de esa columna en 0
    const hacerPivote = (matriz, indiceFilaPivote, indiceColumnaPivote) => {
        const pivote = matriz[indiceFilaPivote][indiceColumnaPivote]; // Obtenemos el valor del pivote
    
        // Paso 1: Dividir la fila del pivote por el valor del pivote para hacer que el pivote sea igual a 1
        for (let j = 0; j < matriz[indiceFilaPivote].length; j++) {
        matriz[indiceFilaPivote][j] /= pivote;
        }
    
        // Paso 2: Restar múltiplos adecuados de la fila del pivote a otras filas para establecer los demás números de esa columna en 0
        for (let i = 0; i < matriz.length; i++) {
        if (i !== indiceFilaPivote) { // No necesitamos hacer nada para la fila del pivote
            const factor = matriz[i][indiceColumnaPivote]; // Obtenemos el elemento en la misma columna que el pivote en la fila actual
            for (let j = 0; j < matriz[i].length; j++) {
            matriz[i][j] -= matriz[indiceFilaPivote][j] * factor;
            }
        }
        }
    };
    
    // Función para verificar si hay variables negativas en la primera fila
    const hayVariablesNegativas = (matriz) => {
        return matriz[0].some((valor) => valor < 0);
    };

    const encontrarValorMasNegativo = (primeraFila) => {
        console.log(Math.min(...primeraFila))
        return Math.min(...primeraFila);
    };
    
    // Función principal para resolver el problema
    const resolverSimplex = (matriz) => {
        while (hayVariablesNegativas(matriz)) {
        const { /*minimo,*/ indiceMinimo } = calcularRadiosYMinimo(matriz);
        hacerPivote(matriz, indiceMinimo + 1, matriz[0].indexOf(encontrarValorMasNegativo(matriz[0])));
        }
        return matriz;
    };
    
    // Ejemplo de uso
    /*const matrizEjemplo = [
        [1, -5, -4, 0, 0, 0],
        [0, 2, -1, 1, 0, 4],
        [0, 5, 3, 0, 1, 15]
    ];*/

    const mostrarMatriz = (matriz) => {
        if (!matriz || matriz.length === 0 || matriz[0].length === 0) {
            return 'Matriz inválida.';
        }
        //return matriz.map(row => "[" + row.join(", ") + "]").join("\n");

        let labels = tableLabels();



        return (
            <table className='table'>
                <tbody>
                    <tr><th>i</th><th>BVS</th>{labels[0]}<th>RHS</th></tr>
                    {matriz.map((row, i) => (
                        <tr key={i}>
                            <td>{i}</td>
                            {labels[1][i]}
                            {row.map((cell, j) => (
                                <td key={j}>{cell}</td>
                                //<td key={j}>{new Fraction(cell).toFraction(true)}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    const tableLabels = () => {
        const labels = [];
        const bvsLabels = [];
        
        bvsLabels.push(<th key="z">z</th>);

        for (let i = 1; i <= variables; i++) {
            labels.push(<th key={"x"+(i)}>x{i}</th>);
        }

        let cont = variables;
        for (let i = 0; i < SAvariables.length; i++) {
            if (SAvariables[i] === 's' || SAvariables[i] === '-s') {
                labels.push(<th key={"s"+(cont)}>s{cont}</th>);
                if (SAvariables[i] === 's')
                    bvsLabels.push(<th key={"s"+(cont)}>s{cont}</th>);
                cont++;
            }
        }

        for (let i = 0; i < SAvariables.length; i++) {
            if (SAvariables[i] === 'a') {
                labels.push(<th key={"a"+(cont)}>a{cont}</th>);
                bvsLabels.push(<th key={"a"+(cont)}>a{cont}</th>);
                cont++;
            }
        }

        return [labels, bvsLabels];
    }

    /*const resultado = resolverSimplex(matrizEjemplo);
    console.log("Resultado:");
    console.log(mostrarMatriz(resultado));*/

    return (
        <div>
            <h1>Esto es BasicSimplex</h1>
            {<button onClick={handleButtonClick}>Imprimir matrix</button>}
            {mostrarMatriz(resolverSimplex(matrix))}
        </div>
    );
}