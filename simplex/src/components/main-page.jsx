import { useState, useEffect } from 'react';
import './Main-page.css'
import { useNavigate } from 'react-router-dom';

function Prueba() {
    const [variables, setVariables] = useState(0);
    const [restrictions, setRestrictions] = useState(0);
    

    return (
            <div className='principal'>
                <h1>Método Simplex</h1>
                <p>Ingrese la cantidad de variables:</p>
                <input className='numberInput' type="number" value={variables} onChange={e => setVariables(e.target.value)} />
                <p>Ingrese la cantidad de restricciones:</p>
                <input className='numberInput' type="number" value={restrictions} onChange={e => setRestrictions(e.target.value)} />
                <Restrictions variables={variables} restrictions ={restrictions} className="prueba"/>
            </div>
    );
}

function Restrictions(params){
    const variables = params.variables;
    const restrictions = params.restrictions;

    const [objective, setObjective] = useState([]);
    const [restric, setRestrictions] = useState([]);
    const [restrictionTypes, setRestrictionTypes] = useState([]);
    const [selection, setSelection] = useState('max'); 
    const [method, setMethod] = useState('comun'); 

    const navigate = useNavigate();

    useEffect(() => {
        if (restrictions > 0) {
            setRestrictionTypes(prev => {
                const numRestrictions = Number(restrictions);
                if (prev.length !== numRestrictions) {
                    return Array(numRestrictions).fill('<=');
                }
                return prev;
            });
        }
    }, [restrictions]);


    const handleVariables = (index, event) => {
        const newVariables = [...objective];
        newVariables[index] = parseInt(event.target.value, 10); // Convierte el valor a entero
        setObjective(newVariables);
    };
    
    const handleRestrictions = (i, j, event) => {
        const newRestrictions = [...restric];
        if (newRestrictions[i] === undefined) {
            newRestrictions[i] = [];
        }
        newRestrictions[i][j] = parseInt(event.target.value, 10); // Convierte el valor a entero
        setRestrictions(newRestrictions);
    }
    
    const handleRestrictionValue = (i, e) => {
        let newRestrictions = [...restric]; // Copia el estado actual
        if (newRestrictions[i] === undefined) {
            newRestrictions[i] = [];
        }
        newRestrictions[i][variables] = parseInt(e.target.value, 10); // Convierte el valor a entero y lo agrega después del símbolo menor que al final del array de restricciones
        setRestrictions(newRestrictions); // Actualiza el estado
    }

    const handleRestrictionType = (index, event) => {
        let newRestrictionTypes = [...restrictionTypes];
        newRestrictionTypes[index] = event.target.value;
        setRestrictionTypes(newRestrictionTypes);
    }

    const addVariables = (index, newRestrictions, pos) => {
        for(let i = 0; i < newRestrictions.length; i++){
            if(i != index){
                newRestrictions[i].splice(pos, 0, 0);
            }
        }
    }

    const sortRestictions = (type, newRestrictions, newRestricTypes) => {
        for(let i = 0; i < restric.length; i++){
            if (restrictionTypes[i] === type) {
                console.log("Esta es la restric: ", restric[i]);
                newRestrictions.push(restric[i]);
                newRestricTypes.push(restrictionTypes[i]);
            }
        }
    }

    const setFinalRestrictions = () => {
        let newRestrictions = [];
        let newRestricTypes = [];
        let SAvariables = [];

        //ordenar las restricciones
        sortRestictions('<=', newRestrictions, newRestricTypes);
        sortRestictions('>=', newRestrictions, newRestricTypes);
        sortRestictions('=', newRestrictions, newRestricTypes);

        for (let index = 0; index < newRestricTypes.length; index++) {
            let pos = newRestrictions[index].length - 1;
            if (newRestricTypes[index] === '<=') {
                // Agregar variable de holgura sumando
                newRestrictions[index].splice(pos, 0, 1); 
                SAvariables.push('s');
                addVariables(index, newRestrictions, pos);           
            }
        }

        for (let index = 0; index < newRestricTypes.length; index++) {
            let pos = newRestrictions[index].length - 1;
            if (newRestricTypes[index] === '>=') {
                // Agregar variable de holgura restando
                newRestrictions[index].splice(pos, 0, -1); 
                SAvariables.push('-s');
                addVariables(index, newRestrictions, pos);
            }
        }

        for (let index = 0; index < newRestricTypes.length; index++) {
            let pos = newRestrictions[index].length - 1;
            if (newRestricTypes[index] === '>=') {
                // Agregar variable artificial sumando
                newRestrictions[index].splice(pos, 0, 1); 
                SAvariables.push('a');
                addVariables(index, newRestrictions, pos);
            }
        }


        for (let index = 0; index < newRestricTypes.length; index++) {
            let pos = newRestrictions[index].length - 1;
            if (newRestricTypes[index] === '=') {
                // Agregar variable artificial sumando
                newRestrictions[index].splice(pos, 0, 1);
                SAvariables.push('a');
                addVariables(index, newRestrictions, pos);
            }
        }

        setRestrictions(newRestrictions);
        return {SAvariables, newRestrictions};
    }

    const setFinalObjective = () => {
        let newObjective = [...objective];
        let additionalLength = restric[0].length - newObjective.length;

        if (additionalLength > 0 && method !== 'granM') {
            newObjective = newObjective.concat(new Array(additionalLength).fill(0));
        }

        if (selection === 'max') {
            newObjective = newObjective.map(num => num !== 0 ? num * -1 : num);
        }

        setObjective(newObjective);
        return {newObjective}; 
    }

    const startSimplex = () => {
        let {SAvariables, newRestrictions} = setFinalRestrictions();
        let {newObjective} = setFinalObjective(); 
        console.log("Estos son los labels: ", SAvariables);

        let matrix = [];
        if (method === '2fases') {
            let wRow = new Array(objective.length).fill(0);
            let artificialVariables = restrictionTypes.filter(type => type === "=" || type === ">=").length;
            let holguraVariables = restrictionTypes.filter(type => type === "<=" || type === ">=").length;
            wRow = wRow.concat(new Array(holguraVariables).fill(0));
            wRow = wRow.concat(new Array(artificialVariables).fill(1));
            wRow = wRow.concat(new Array(1).fill(0));

            matrix = [wRow, newObjective, ...newRestrictions];
        }
        else if (method === 'granM') {
            let mObjective = [...newObjective];
            let artificialVariables = restrictionTypes.filter(type => type === "=" || type === ">=").length;
            let holguraVariables = restrictionTypes.filter(type => type === "<=" || type === ">=").length;
            mObjective = mObjective.concat(new Array(holguraVariables).fill(0));
            mObjective = mObjective.concat(new Array(artificialVariables).fill(1000));
            mObjective = mObjective.concat(new Array(1).fill(0));

            matrix = [mObjective, ...newRestrictions];
        }
        else {
            matrix = [newObjective, ...newRestrictions];
        }
        
        console.log("Esta es la matriz: ", matrix);
        
        navigate('/iterations', {state: { matrix, variables, SAvariables, method, selection}}); 
    }

    return(
        <div className='prueba'>
            {variables > 0 && (
                <>
                    <p>Objetivo:</p>
                    <select value={selection} onChange={e => setSelection(e.target.value)}>
                        <option value="max">Maximizar</option>
                        <option value="min">Minimizar</option>
                    </select>
                    <p>Método:</p>
                    <select value={method} onChange={e => setMethod(e.target.value)}>
                        <option value="comun">Común</option>
                        <option value="2fases">Dos fases</option>
                        <option value="granM">Gran M</option>
                    </select>
                    <p>Función objetivo:</p>
                    <div className='restrictions'>
                        {(() => {
                            const variab = [];
                            for (let i = 0; i < variables; i++) {
                                if(i+1 != variables){
                                    variab.push(<div className='variables' key={"x"+(i+1)}>
                                        <div className='inputs'>
                                            <input type='number' onChange={(e) => handleVariables(i, e)} ></input>
                                            <p>x{i+1}</p>
                                        </div>
                                        <p> + </p>
                                    </div>);
                                }
                                else{
                                    variab.push(<div className='variables' key={"x"+(i+1)}>
                                        <div className='inputs'>
                                            <input type='number' onChange={(e) => handleVariables(i, e)} ></input>
                                            <p> x{i+1} </p>
                                        </div>
                                    </div>);
                                }
                            }
                            return variab;
                        })()}
                    </div>
                </>
                
            )}
            {variables > 0 && restrictions > 0 &&(
        <>
        <p>Restricciones:</p>
            {(() => {
                let restric = [];
                let variab = [];
                for(let i = 0; i < restrictions; i++){
                    for (let j = 0; j < variables; j++) {
                        if(j+1 != variables){
                            variab.push(<div className='variables' key={"x"+(j+1)+i}>
                                <div className='inputs'>
                                    <input type='number' onChange={(e) => handleRestrictions(i, j, e)}></input>
                                    <p> x{j+1} </p>
                                </div>
                                <p> + </p>
                            </div>);
                        }
                        else{
                            variab.push(<div className='variables' key={"x"+(j+1)+i}>
                                <div className='inputs'>
                                    <input type='number' onChange={(e) => handleRestrictions(i, j, e)}></input>
                                    <p> x{j+1} </p>
                                </div>
                                <select className='resSelect' value={restrictionTypes[i]} onChange={(e) => handleRestrictionType(i, e)}>
                                    <option value="<=">{'<='}</option>
                                    {method !== 'comun' && (
                                        <>
                                            <option value=">=">{'>='}</option>
                                            <option value="=">{'='}</option>
                                        </>
                                    )}
                                </select>
                                <input className='numberInput' type='number' onChange={(e) => handleRestrictionValue(i, e)}></input>
                            </div>);
                        }
                    }
                    restric.push(<div className='restrictions' key={i}>{variab}</div>);
                    variab = [];
                }
                return restric;
            })()}
            <button className='btn' onClick={() => startSimplex()}>Comenzar</button>
        </>
    )}
</div>
    );
}


export {Prueba};