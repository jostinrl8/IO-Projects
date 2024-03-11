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
    
    const renderRestrictions = () => {
        const restric = [];
        let variab = [];
        for(let i = 0; i < restrictions; i++){
            for (let j = 0; j < variables; j++) {
                if(j+1 != variables){
                    variab.push(<div className='variables' key={"x"+(j+1)+i}>
                        <input type='number'></input>
                        <p> x{j+1} + </p>
                    </div>);
                }
                else{
                    variab.push(<div className='variables' key={"x"+(j+1)+i}>
                        <input type='number'></input>
                        <p> x{j+1} </p>
                        <p> {'<='} </p>
                        <input type='number'></input>
                    </div>);
                }
            }
            restric.push(<div className='restrictions' key={i}>{variab}</div>);
            variab = [];
        }
        return restric;
    }

    return(
        <div>
            {variables != 0 && restrictions != 0 &&(
                <>
                    <p>Ingrese las restricciones</p>
                    {renderRestrictions()}
                </>
            )}
        </div>
    );
}

export {Prueba};