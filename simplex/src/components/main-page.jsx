import { useState, useEffect } from 'react';
import './Main-page.css'
import { useNavigate } from 'react-router-dom';

function Prueba() {
    const [variables, setVariables] = useState(0);
    const [restrictions, setRestrictions] = useState(0);

    return (
        <>
            <h1>Método Simplex</h1>
            <p>Ingrese la cantidad de variables</p>
            <input type="text" value={variables} onChange={e => setVariables(e.target.value)} />
            <p>Ingrese la cantidad de restricciones</p>
            <input type="text" value={restrictions} onChange={e => setRestrictions(e.target.value)} />
            <Restrictions variables={variables} restrictions ={restrictions} />
        </>
    );
}

function Restrictions(params){
    const variables = params.variables;
    const restrictions = params.restrictions;

    const [objective, setObjective] = useState([]);
    const [restric, setRestrictions] = useState([]);
    const [restrictionTypes, setRestrictionTypes] = useState([]);
    const [selection, setSelection] = useState('max'); // Nuevo estado para guardar la selección de la función objetivo

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

    const setFinalRestrictions = () => {
        let newRestrictions = [...restric];
        let SAvariables = [];

        for (let index = 0; index < restrictionTypes.length; index++) {
            let pos = newRestrictions[index].length - 1;
            switch (restrictionTypes[index]) {
                case '<=':
                    // Agregar variable de holgura sumando
                    newRestrictions[index].splice(pos, 0, 1); 
                    SAvariables.push('s');
                    addVariables(index, newRestrictions, pos);
                    break;
                case '>=':
                    // Agregar variable de holgura restando
                    newRestrictions[index].splice(pos, 0, -1); 
                    SAvariables.push('-s');
                    // Agregar variable artificial sumando
                    newRestrictions[index].splice(pos + 1, 0, 1);
                    SAvariables.push('a'); 
                    addVariables(index, newRestrictions, pos);
                    addVariables(index, newRestrictions, pos + 1);
                    break;
                case '=':
                    // Agregar variable artificial sumando
                    newRestrictions[index].splice(pos, 0, 1); 
                    SAvariables.push('a');
                    addVariables(index, newRestrictions, pos);
                    break;
                default:
                    break;
            }
        }
        setRestrictions(newRestrictions);
        return SAvariables;
    }

    const setFinalObjective = () => {
        let newObjective = [...objective];
        let additionalLength = restric[0].length - newObjective.length;

        if (additionalLength > 0) {
            newObjective = newObjective.concat(new Array(additionalLength).fill(0));
        }

        if (selection === 'max') {
            newObjective = newObjective.map(num => num !== 0 ? num * -1 : num);
        }

        setObjective(newObjective);
        return newObjective; 
    }

    const startSimplex = () => {
        let SAvariables = setFinalRestrictions();
        let newObjective = setFinalObjective(); 
        console.log("Estos son los labels: ", SAvariables);

        let matrix = [newObjective, ...restric]; 
        
        navigate('/iterations', {state: { matrix, variables, SAvariables}}); 
    }

    return(
        <div>
            {variables > 0 && (
                <>
                    <select value={selection} onChange={e => setSelection(e.target.value)}>
                        <option value="max">Maximizar</option>
                        <option value="min">Minimizar</option>
                    </select>
                    <p>Función objetivo:</p>
                    <div className='restrictions'>
                        {(() => {
                            const variab = [];
                            for (let i = 0; i < variables; i++) {
                                if(i+1 != variables){
                                    variab.push(<div className='variables' key={"x"+(i+1)}>
                                        <input type='number' onChange={(e) => handleVariables(i, e)} ></input>
                                        <p> x{i+1}</p>
                                        <p> + </p>
                                    </div>);
                                }
                                else{
                                    variab.push(<div className='variables' key={"x"+(i+1)}>
                                        <input type='number' onChange={(e) => handleVariables(i, e)} ></input>
                                        <p> x{i+1} </p>
                                    </div>);
                                }
                            }
                            return variab;
                        })()}
                    </div>
                    <button onClick={() => {console.log(objective)}}>Imprimir objective</button>
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
                                <input type='number' onChange={(e) => handleRestrictions(i, j, e)}></input>
                                <p> x{j+1} </p>
                                <p> + </p>
                            </div>);
                        }
                        else{
                            variab.push(<div className='variables' key={"x"+(j+1)+i}>
                                <input type='number' onChange={(e) => handleRestrictions(i, j, e)}></input>
                                <p> x{j+1} </p>
                                <select value={restrictionTypes[i]} onChange={(e) => handleRestrictionType(i, e)}>
                                    <option value="<=">{'<='}</option>
                                    <option value=">=">{'>='}</option>
                                    <option value="=">{'='}</option>
                                </select>
                                <input type='number' onChange={(e) => handleRestrictionValue(i, e)}></input>
                            </div>);
                        }
                    }
                    restric.push(<div className='restrictions' key={i}>{variab}</div>);
                    variab = [];
                }
                return restric;
            })()}
            <button onClick={() => {console.log(restric); console.log(restrictionTypes);}}>Imprimir restric</button>
            <button onClick={() => startSimplex()}>Comenzar</button>
        </>
    )}
</div>
    );
}


export {Prueba};