import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Iterations-page.css';
//import Fraction from 'fraction.js';

export function BasicSimplex() {

    const location = useLocation();
    const navigate = useNavigate();

    const matrix = location.state.matrix;
    const variables = location.state.variables;
    const SAvariables = location.state.SAvariables;
    const [method, setMethod] = useState(location.state.method);
    const selection = location.state.selection;

    /*const matrix = [
        [-1, -2, 0, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 1, 0, 0, 5],
        [1, 1, -1, 0, 0, 1, 0, 1], 
        [-1, 1, 0, -1, 0, 0, 1, 3]
      ];
    const variables = 2;
    const SAvariables = ['s', '-s', 'a', '-s', 'a'];
    const [method, setMethod] = useState('granM');*/

    const [iteCont, setIteCont] = useState(0);
    const [result, setResult] = useState(null);
    const [iterations, setIterations] = useState([]);
    const [iterMatrix, setIterMatrix] = useState([]);
    const [isEndProcess, setIsEndProcess] = useState(false);
    const [isError, setIsError] = useState(false);


    useEffect(() => {
        setResult(iteracion(matrix));
    }, [iteCont]);

    const handleButtonClick = () => {
        setIteCont(iteCont + 1);
    };

    const tableLabels = () => {
        const labels = [];
        const bvsLabels = [];

        if (method === '2fases') {
            bvsLabels.push(<th key="-w">-w</th>);
        }

        if (selection === 'max') {
            bvsLabels.push(<th key="z">z</th>);
        } 
        else {
            bvsLabels.push(<th key="-z">-z</th>);
        }

        for (let i = 1; i <= variables; i++) {
            labels.push(<th key={"x" + (i)}>x{i}</th>);
        }

        let cont = parseInt(variables) + 1;
        for (let i = 0; i < SAvariables.length; i++) {
            if (SAvariables[i] === 's' || SAvariables[i] === '-s') {
                labels.push(<th key={"s" + (cont)}>s{cont}</th>);
                if (SAvariables[i] === 's')
                    bvsLabels.push(<th key={"s" + (cont)}>s{cont}</th>);
                cont++;
            }
        }

        for (let i = 0; i < SAvariables.length; i++) {
            if (SAvariables[i] === 'a') {
                labels.push(<th key={"a" + (cont)}>a{cont}</th>);
                bvsLabels.push(<th key={"a" + (cont)}>a{cont}</th>);
                cont++;
            }
        }

        return { labels, bvsLabels };
    }
    const { labels, bvsLabels } = tableLabels();
    const [finalBVS, setFinalBVS] = useState(bvsLabels);

    const calcularRadiosYMinimo = (matriz) => {
        const valorEntrante = encontrarValorMasNegativo(matriz[0]); // Encuentra el valor más negativo en la fila de la función objetivo
        const radios = [];
        let filaInicio = method === '2fases' ? 2 : 1;
        matriz.slice(filaInicio).forEach((fila) => { // Comenzamos desde la segunda fila
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

        if (minimo === Infinity) {
            console.log("No se encontró un pivote válido.");
            return {minimo: -1, indiceMinimo: -1, radios: -1, valorEntrante}; 
        }

        for (let i = 0; i < finalBVS.length; i++) {
            let k = finalBVS[i].key;
            finalBVS[i] = <th key={k} className='normal'>{k}</th>;
            let incremento = method === '2fases' ? 2 : 1;
            if (indiceMinimo + incremento === i) {
                //let k = labels[matriz[0].indexOf(valorEntrante)].key;
                finalBVS[i] = <th key={k} className="exitV">{k}</th>;
            }
        }

        return { minimo, indiceMinimo, radios, valorEntrante };
    };

    const encontrarFilaConUno = (matriz, columna) => {
        for (let fila = 1; fila < matriz.length; fila++) {
            if (matriz[fila][columna] === 1) {
                return fila;
            }
        }
        return -1;
    };

    // Función para hacer que el pivote sea igual a 1 y establecer los demás números de esa columna en 0
    const hacerOperacionesFila = (matriz, indiceFilaPivote, indiceColumnaPivote) => {
        console.log("iteracion: ", iteCont)
        let copia = JSON.parse(JSON.stringify(matriz));
        console.log("Matriz antes de la iteración: ", copia);
        const pivote = matriz[indiceFilaPivote][indiceColumnaPivote]; // Obtenemos el valor del pivote

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
        let hayNe = matriz[0].slice(0, -1).some((valor) => valor < 0);
        console.log("hayNe: ", hayNe);
        return matriz[0].slice(0, -1).some((valor) => valor < 0);
    };

    const encontrarValorMasNegativo = (primeraFila) => {
        const valores = primeraFila.slice(0, -1);
        let index = primeraFila.indexOf(Math.min(...valores));
        for (let i = 0; i < labels.length; i++) {
            let k = labels[i].key;
            labels[i] = <th key={k} className='normal'>{k}</th>;
            if (index === i) {
                labels[i] = <th key={k} className="enterV">{k}</th>;
            }
        }

        return Math.min(...valores);
    };

    const cambiarBVS = (matriz, valorEntrante) => {
        let newBvsLabels = [...finalBVS];
        for (let i = 0; i < newBvsLabels.length; i++) {
            if (newBvsLabels[i].props.className === 'exitV') {
                let k = labels[matriz[0].indexOf(valorEntrante)].key;
                newBvsLabels[i] = <th key={k} className="exitV">{k}</th>;
            }
        }
        setFinalBVS(newBvsLabels);
    }

    // Función para la Fase 1 del método de las dos fases
    const fase1 = (matriz, numVariablesArtificiales) => {
        const numColumnas = matriz[0].length;
        const indiceUltimaColumna = numColumnas - 1;

        // Iteración para hacer que los elementos correspondientes a las variables artificiales sean iguales a cero
        for (let i = 1; i <= numVariablesArtificiales; i++) {
            const columnaActual = i + matriz[0].length - numVariablesArtificiales - 2;
            const filaActual = encontrarFilaConUno(matriz, columnaActual);
            if (method === 'granM'){
                matriz[0][columnaActual] = 1000
            }
            if (filaActual !== -1) {
                hacerOperacionesFila(matriz, filaActual, columnaActual);
            } else {
                console.log("No se encontró un 1 en la columna ", columnaActual);
            }
        }
    };

    const eliminarColumnasFilas = (matriz, numVariablesArtificiales) => {
        matriz.forEach((fila) => {
            fila.splice(-numVariablesArtificiales - 1, numVariablesArtificiales);
        });
        matriz.splice(0, 1);
        return matriz;
    };

    const verificaYelimina = (matriz) => {
        const numArtif = SAvariables.filter((variable) => variable === 'a').length;
        for (let i = labels.length - numArtif; i < labels.length; i++) {
            let contNum = 0;
            for (let j = 0; j < matriz.length; j++) {
                if (matriz[j][i] === 0) {
                    contNum++;
                    if (contNum >= matriz.length-1) {
                        return -1;
                    }
                }
            }
        }
        
        // Eliminar las columnas de las variables artificiales
        matriz.forEach((fila) => {
            fila.splice(-numArtif-1, numArtif);
        });
        // Eliminar la fila 0
        if (method === '2fases'){
            matriz.splice(0, 1);
            let newBvsLabels = [...finalBVS];
            newBvsLabels.splice(0, 1);
            setFinalBVS(newBvsLabels);
        }
        return matriz;
    }

    const elimArtif = () => {
        const numArtif = SAvariables.filter((variable) => variable === 'a').length;
        labels.splice(-numArtif, numArtif);
    }

    // Función principal para resolver el problema
    const iteracion = (matriz) => {
        console.log("Metodo: ", method);
        if (method === '2fases') {
            if(iteCont === 0){
                let iter = mostrarMatriz(matriz, []);
                setIterations(prevMatrix => [...prevMatrix, iter]);
                const numVariablesArtificiales = SAvariables.filter((variable) => variable === 'a').length;
                fase1(matriz, numVariablesArtificiales);
                setIterMatrix(prevMatrix => [...prevMatrix, matriz]);
                return iter;
            }
            else{
                matriz = iterMatrix[iteCont - 1];
                if (!hayVariablesNegativas(matriz)) {
                    console.log("No hay variables negativas");
                    let iter = mostrarMatriz(matriz, []);
                    setIterations(prevMatrix => [...prevMatrix, iter]);
                    let nuevaMatriz = verificaYelimina(matriz);
                    if (nuevaMatriz === -1) {
                        setIsEndProcess(true);
                        setIsError(true);
                        let iter = mostrarMatriz(matriz, -2);
                        setIterations(prevMatrix => [...prevMatrix, iter]);
                        return iter;
                    }
                    setMethod('cambio');
                    setIterMatrix(prevMatrix => [...prevMatrix, nuevaMatriz]);
                    return iter;
                }
                else{
                    let { minimo, indiceMinimo, radios, valorEntrante } = calcularRadiosYMinimo(matriz);
                    if (minimo === Infinity) {
                        setIsEndProcess(true);
                        setIsError(true);
                        let iter = mostrarMatriz(matriz, -1);
                        setIterations(prevMatrix => [...prevMatrix, iter]);
                        return iter;
                    }
                    let iter = mostrarMatriz(matriz, radios);
                    cambiarBVS(matriz, valorEntrante);
                    setIterations(prevMatrix => [...prevMatrix, iter]);
                    hacerOperacionesFila(matriz, indiceMinimo + 2, matriz[0].indexOf(encontrarValorMasNegativo(matriz[0])));
                    setIterMatrix(prevMatrix => [...prevMatrix, matriz]);
                    return iter;
                }
            }
        }
        if (method === 'granM') {
            if(iteCont === 0){
                let iter = mostrarMatriz(matriz, []);
                setIterations(prevMatrix => [...prevMatrix, iter]);
                const numVariablesArtificiales = SAvariables.filter((variable) => variable === 'a').length;
                fase1(matriz, numVariablesArtificiales);
                setIterMatrix(prevMatrix => [...prevMatrix, matriz]);
                return iter;
            }
            else{
                matriz = iterMatrix[iteCont - 1];
                if (!hayVariablesNegativas(matriz)) {
                    let iter = mostrarMatriz(matriz, []);
                    setIterations(prevMatrix => [...prevMatrix, iter]);
                    let nuevaMatriz = verificaYelimina(matriz);
                    if (nuevaMatriz === -1) {
                        setIsEndProcess(true);
                        setIsError(true);
                        let iter = mostrarMatriz(matriz, -2);
                        setIterations(prevMatrix => [...prevMatrix, iter]);
                        return iter;
                    }
                    setMethod('cambio');
                    setIterMatrix(prevMatrix => [...prevMatrix, nuevaMatriz]);
                    return iter;
                }
                else{
                    let { minimo, indiceMinimo, radios, valorEntrante } = calcularRadiosYMinimo(matriz);
                    if (minimo === Infinity) {
                        setIsEndProcess(true);
                        setIsError(true);
                        let iter = mostrarMatriz(matriz, -1);
                        setIterations(prevMatrix => [...prevMatrix, iter]);
                        return iter;
                    }
                    let iter = mostrarMatriz(matriz, radios);
                    cambiarBVS(matriz, valorEntrante);
                    setIterations(prevMatrix => [...prevMatrix, iter]);
                    hacerOperacionesFila(matriz, indiceMinimo + 1, matriz[0].indexOf(encontrarValorMasNegativo(matriz[0])));
                    setIterMatrix(prevMatrix => [...prevMatrix, matriz]);
                    return iter;
                }
            }

        }

        if (hayVariablesNegativas(matriz) || method === 'cambio') {
            if (iteCont === 0) {
                let { minimo, indiceMinimo, radios, valorEntrante } = calcularRadiosYMinimo(matriz);
                if (minimo === Infinity) {
                    setIsEndProcess(true);
                    setIsError(true);
                    let iter = mostrarMatriz(matriz, -1);
                    setIterations(prevMatrix => [...prevMatrix, iter]);
                    return iter;
                }
                let iter = mostrarMatriz(matriz, radios);
                console.log("finalBVS: ", finalBVS);
                cambiarBVS(matriz, valorEntrante);
                setIterations(prevMatrix => [...prevMatrix, iter]);
                hacerOperacionesFila(matriz, indiceMinimo + 1, matriz[0].indexOf(encontrarValorMasNegativo(matriz[0])));
                setIterMatrix(prevMatrix => [...prevMatrix, matriz]);
                return iter;
            }
            else {
                if (method === 'cambio') {
                    setMethod('elimArtif');
                    elimArtif();
                }
                matriz = iterMatrix[iteCont - 1];
                if (!hayVariablesNegativas(matriz)) {
                    if (method === 'elimArtif') {
                        elimArtif();
                    }
                    let iter = mostrarMatriz(matriz, []);
                    setIterations(prevMatrix => [...prevMatrix, iter]);
                    setIsEndProcess(true);
                    return iter;
                }
                if (method === 'elimArtif') {
                    elimArtif();
                }
                let {minimo, indiceMinimo, radios, valorEntrante } = calcularRadiosYMinimo(matriz);
                if (minimo === Infinity) {
                    setIsEndProcess(true);
                    setIsError(true);
                    let iter = mostrarMatriz(matriz, -1);
                    setIterations(prevMatrix => [...prevMatrix, iter]);
                    return iter;
                }
                let iter = mostrarMatriz(matriz, radios);
                console.log("finalBVS: ", finalBVS);
                cambiarBVS(matriz, valorEntrante);
                setIterations(prevMatrix => [...prevMatrix, iter]);
                hacerOperacionesFila(matriz, indiceMinimo + 1, matriz[0].indexOf(encontrarValorMasNegativo(matriz[0])));
                let copia = JSON.parse(JSON.stringify(matriz));
                console.log("Matriz después de la iteración: ", copia);
                setIterMatrix(prevMatrix => [...prevMatrix, matriz]);
                return iter;
            }
        }
        console.log("Fin de la iteración");
        setIsEndProcess(true);
        matriz = iterMatrix[iteCont - 1];
        if (method === 'elimArtif') {
            elimArtif();
        }
        return mostrarMatriz(matriz, []);
    };

    const mostrarMatriz = (matriz, radios) => {
        if (!matriz || matriz.length === 0 || matriz[0].length === 0) {
            return 'Matriz inválida.';
        }
        console.log("radios: ", radios);

        if (radios === -1) {
            setIsEndProcess(true);
            setIsError(true);
            console.log("iterMatrix en no acotado: ", iterMatrix[iteCont-1]);
            return (
                <div>
                    <h1>Problema no acotado</h1>
                    <p>El algoritmo no pudo encontrar un radio distinto a +INF</p>
                </div>
            )
        }
        else if(radios === -2){
            setIsEndProcess(true);
            setIsError(true);
            return (
                <div>
                    <h1>Problema no factible</h1>
                    <p>El algoritmo sigue encontrando varibles artificiales básicas cuando no hay valores negativos en la fila -w</p>
                </div>
            )
        }

        if (radios.length === 0) {
           for (let i = 0; i < finalBVS.length; i++) {
                let k = finalBVS[i].key;
                finalBVS[i] = <th key={k} className='normal'>{k}</th>;
            }
        }
        console.log("finalBVS: ", finalBVS)
        console.log("iterMatrix: ", iterMatrix[iteCont]);
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
                    {matriz.map((row, i) => {
                        let indiceRadio = method === '2fases' ? i - 2 : i - 1;
                        return (
                            <tr key={i}>
                                <td>{i}</td>
                                {finalBVS[i]}
                                {row.map((cell, j) => (
                                    <td key={j}>{cell}</td>
                                    //<td key={j}>{new Fraction(cell).toFraction(true)}</td>
                                ))}
                                {radios.length > 0 && <td>{radios[indiceRadio] === Infinity ? "+INF" : radios[indiceRadio]}</td>}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    };

    return (
        <div className='principal'>
            {!isEndProcess && <h1>Iteración {iteCont}</h1>}
            <div className='iteraciones'>
                {result}
                {!isEndProcess && <button className='btn' onClick={handleButtonClick}>Siguiente iteración</button>}
            </div>
            {isEndProcess && (
                <div className='resultados'>
                    {!isError && (
                    <div className='resultados'>
                        <h2>Resultados</h2>
                        <table className='results'>
                            <tbody>
                                <tr>
                                    <th>Variable</th>
                                    <th>Valor</th>
                                </tr>
                                {finalBVS.map((bvs, i) => (
                                    <tr key={i}>
                                        <td><b>{bvs.key}</b></td>
                                        <td>{iterMatrix[iteCont-1][i][iterMatrix[iteCont-1][i].length -1]}</td>
                                    </tr>    
                                ))}
                            </tbody>
                        </table>
                    </div>
                    )}
                    <div className='buttons'>
                        <button className='btn' onClick={() => window.location.reload()}>Ver de nuevo las iteraciones</button>
                        <button className='btn' onClick={() => navigate('/') }>Volver al inicio</button>
                    </div>
                </div>
                )}
        </div>
    );
}