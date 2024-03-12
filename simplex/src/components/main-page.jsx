import { useState } from 'react';
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
        console.log("j: ", j);
        newRestrictions[i][j] = event.target.value;
        setRestrictions(newRestrictions);
    }

    return(
        <div>
            {variables != 0 && (
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
            {variables != 0 && restrictions != 0 &&(
                <>
                    <p>Restricciones:</p>
                    {(() => {
                        const restric = [];
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
                                        <p> {'<='} </p>
                                        <input type='number' onChange={(e) => handleRestrictions(i, j, e)}></input>
                                    </div>);
                                }
                            }
                            restric.push(<div className='restrictions' key={i}>{variab}</div>);
                            variab = [];
                        }
                        return restric;
                    })()}
                    <button onClick={() => {console.log(restric)}}>Imprimir restric</button>
                </>
            )}
        </div>
    );
}

export {Prueba};