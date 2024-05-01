import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Iterations-page.css';
//import Fraction from 'fraction.js';

export function BasicSimplex() {
    
    const location = useLocation();
    const matrix = location.state.matrix;
    const variables = location.state.variables;
    const SAvariables = location.state.SAvariables;
    const [iteCont, setIteCont] = useState(0);

    const [result, setResult] = useState(null);
    const [iterations, setIterations] = useState([]);
    const [iterMatrix, setIterMatrix] = useState([]);

    useEffect(() => {
        setResult(iteracion(matrix));
    }, [iteCont]);

    const handleButtonClick = () => {
        setIteCont(iteCont + 1);
    };

    const tableLabels = () => {
        const labels = [];
        const bvsLabels = [];
        
        bvsLabels.push(<th key="z">z</th>);

        for (let i = 1; i <= variables; i++) {
            labels.push(<th key={"x"+(i)}>x{i}</th>);
        }

        let cont = parseInt(variables) + 1;
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

        return {labels, bvsLabels};
    }
    const {labels, bvsLabels } = tableLabels();

    const calcularRadiosYMinimo = (matriz) => {
        console.log("Calcular radios. Valor de la matriz: ", matriz)
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

        for (let i = 0; i < bvsLabels.length; i++) {
            let k = bvsLabels[i].key;
            bvsLabels[i] = <th key={k} className='normal'>{k}</th>;
            if(indiceMinimo+1 === i){
                //let k = labels[matriz[0].indexOf(valorEntrante)].key;
                bvsLabels[i] = <th key={k} className="exitV">{k}</th>;
            }
        }
        
        return { minimo, indiceMinimo, radios, valorEntrante};
    };
    
    // Función para hacer que el pivote sea igual a 1 y establecer los demás números de esa columna en 0
    const hacerPivote = (matriz, indiceFilaPivote, indiceColumnaPivote) => {
        //console.log("Este es el del BVS", labels[1][indiceFilaPivote])
        
        const pivote = matriz[indiceFilaPivote][indiceColumnaPivote]; // Obtenemos el valor del pivote
        console.log("Pivote: ", pivote);
    
        // Paso 1: Dividir la fila del pivote por el valor del pivote para hacer que el pivote sea igual a 1
        for (let j = 0; j < matriz[indiceFilaPivote].length; j++) {
            matriz[indiceFilaPivote][j] = matriz[indiceFilaPivote][j] / pivote;
        }
    
        // Paso 2: Restar múltiplos adecuados de la fila del pivote a otras filas para establecer los demás números de esa columna en 0
        for (let i = 0; i < matriz.length; i++) {
            if (i !== indiceFilaPivote) {
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
        console.log("Entre al encontrar valor mas negativo")
        let index = primeraFila.indexOf(Math.min(...primeraFila));
        for (let i = 0; i < labels.length; i++) {
            let k = labels[i].key;
            labels[i] = <th key={k} className='normal'>{k}</th>;
            if(index === i){
                labels[i] = <th key={k} className="enterV">{k}</th>;
            }
        }

        return Math.min(...primeraFila);
    };

    const cambiarBVS = (matriz, valorEntrante) => {
        for (let i = 0; i < bvsLabels.length; i++) {
            if(bvsLabels[i].props.className === 'exitV'){
                let k = labels[matriz[0].indexOf(valorEntrante)].key;
                bvsLabels[i] = <th key={k} className="exitV">{k}</th>;
                console.log("Este es el nuevo del BVS", bvsLabels[i])
            }
        }
    }
    
    // Función principal para resolver el problema
    const iteracion = (matriz) => {
        if (hayVariablesNegativas(matriz)) {
            console.log("Iteración: ", iteCont);
            if(iteCont === 0){
                let { __minimo, indiceMinimo, radios, valorEntrante } = calcularRadiosYMinimo(matriz);
                //iterations.push(mostrarMatriz(matriz, radios));
                console.log("estos son los bvs: ", bvsLabels)
                let iter = mostrarMatriz(matriz, radios);
                cambiarBVS(matriz, valorEntrante);
                setIterations(prevMatrix => [...prevMatrix, iter]);
                hacerPivote(matriz, indiceMinimo + 1, matriz[0].indexOf(encontrarValorMasNegativo(matriz[0])));
                setIterMatrix(prevMatrix => [...prevMatrix, matriz]);
                return iter;
            }
            else{
                matriz = iterMatrix[iteCont-1];
                console.log("Matriz: ", matriz)
                let {__minimo, indiceMinimo, radios, valorEntrante} = calcularRadiosYMinimo(matriz);
                //iterations.push(mostrarMatriz(matriz, radios));
                console.log("estos son los bvs: ", bvsLabels)
                let iter = mostrarMatriz(matriz, radios);
                cambiarBVS(matriz, valorEntrante);
                setIterations(prevMatrix => [...prevMatrix, iter]);
                hacerPivote(matriz, indiceMinimo + 1, matriz[0].indexOf(encontrarValorMasNegativo(matriz[0])));
                setIterMatrix(prevMatrix => [...prevMatrix, matriz]);
                return iter;
            }
        }
        console.log("Fin de la iteración");
        return mostrarMatriz(matriz, []);
    };

    const mostrarMatriz = (matriz, radios) => {
        if (!matriz || matriz.length === 0 || matriz[0].length === 0) {
            return 'Matriz inválida.';
        }

        return (
            <table className='table'>
                <tbody>
                    <tr>
                        <th>i</th>
                        <th>BVS</th>
                        {labels}
                        <th>RHS</th>
                        {radios.length > 0 && <th>Radios</th>}
                    </tr>
                    {matriz.map((row, i) => (
                        <tr key={i}>
                            <td>{i}</td>
                            {bvsLabels[i]}
                            {row.map((cell, j) => (
                                <td key={j}>{cell}</td>
                                //<td key={j}>{new Fraction(cell).toFraction(true)}</td>
                            ))}
                            {radios.length > 0 && <td>{radios[i-1] === Infinity ? "+INF" : radios[i-1]}</td>}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    /*const resultado = resolverSimplex(matrizEjemplo);
    console.log("Resultado:");
    console.log(mostrarMatriz(resultado));*/
    
    return (
        <div className='principal'>
            <h1>Iteración {iteCont}</h1>
            {result}
            <button className='btn' onClick={handleButtonClick}>Siguiente iteración</button>
        </div>
    );
}