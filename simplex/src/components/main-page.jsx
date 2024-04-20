import { useState, useEffect } from 'react';
import './Main-page.css'

function Prueba() {
    const [variables, setVariables] = useState(0);
    const [restrictions, setRestrictions] = useState(0);

    /*const handleButtonClick = () => {
        console.log(variables);
        console.log(restrictions);
    }*/

    return (
        <>
            <h1>Método Simplex</h1>
            <p>Ingrese la cantidad de variables</p>
            <input type="text" value={variables} onChange={e => setVariables(e.target.value)} />
            <p>Ingrese la cantidad de restricciones</p>
            <input type="text" value={restrictions} onChange={e => setRestrictions(e.target.value)} />
            {/*<button onClick={handleButtonClick}>Enviar</button>*/}
            <Restrictions variables={variables} restrictions ={restrictions} />
        </>
    );
}

function Restrictions(params){
    const variables = params.variables;
    const restrictions = params.restrictions;

    const [objetive, setVariables] = useState([]);
    const [restric, setRestrictions] = useState([]);
    const [restrictionTypes, setRestrictionTypes] = useState([]);

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
        const newVariables = [...objetive];
        newVariables[index] = event.target.value;
        setVariables(newVariables);
    };

    const handleRestrictions = (i, j, event) => {
        const newRestrictions = [...restric];
        if (newRestrictions[i] === undefined) {
            newRestrictions[i] = [];
        }
        newRestrictions[i][j] = event.target.value;
        setRestrictions(newRestrictions);
    }

    const handleRestrictionValue = (i, e) => {
        let newRestrictions = [...restric]; // Copia el estado actual
        if (newRestrictions[i] === undefined) {
            newRestrictions[i] = [];
        }
        newRestrictions[i][variables] = e.target.value; // Agrega el valor después del símbolo menor que al final del array de restricciones
        setRestrictions(newRestrictions); // Actualiza el estado
    }

    const handleRestrictionType = (i, e) => {
        let newRestrictionTypes = [...restrictionTypes]; // Copia el estado actual
        newRestrictionTypes[i] = e.target.value; // Actualiza el tipo de restricción
        setRestrictionTypes(newRestrictionTypes); // Actualiza el estado
    }

    return(
        <div>
            {variables > 0 && (
                <>
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
                    <button onClick={() => {console.log(objetive)}}>Imprimir objective</button>
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
        </>
    )}
</div>
    );
}

export {Prueba};