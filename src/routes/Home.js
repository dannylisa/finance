import React, { useState, useEffect } from 'react';
import Search from 'components/Search';
import Selected from 'components/Selected';
import DataChart from 'components/DataChart';

const shuffle =(array) => array.map(a => ([Math.random(),a]))
                                .sort((a,b) => a[0]-b[0])
                                .map(a => a[1])
const Home = () => {
    const [defaultStrokes, setStrokes] = useState(["#8884d8", "#ff9d44", "#44aaff","#73c96c", "#ee3333"]);
    useEffect(() => {
        setStrokes(prev => shuffle(prev));
    }, [])
    
    const useSelected = () => {
        const [selected, setSelected] = useState([]);
        const [labels, setLabels] = useState([]);
        const select = (newData) => {
            const newLabel = newData.putLabel();
            if(labels.includes(newLabel)){
                alert('이미 선택한 데이터입니다!')
                return;
            } else if(labels.length>=4){
                alert('4개 데이터까지만 비교할 수 있습니다.');
                return;
            }
            setSelected(prev => [...prev, newData]);
            setLabels(prev => [...prev, newLabel]);
        }
        const updateSelected = (idx, newData) => {
            setSelected(prev => {
                prev.splice(idx, 1, newData);
                return [...prev];
            })
        }
        const removeSelected = (idx) => {
            setSelected(prev => prev.filter((p, index)=> index!==idx));
            setLabels(prev => prev.filter((p, index)=> index!==idx));
        }
        const removeAll = (idx) => {
            setSelected([]);
            setLabels([]);
        }
        return [selected, labels, select, updateSelected, removeSelected, removeAll];
    }
    const [selected, labels, select, updateSelected, removeSelected, removeAll] = useSelected();

    useEffect(()=>{
        console.log('selected changed');
        selected.length && console.log(selected[0]);
    },[selected])

    return(
        <>
        <div style={{height:'400px'}}>
            {selected.length>0 && <DataChart datas={selected} xAxis="date"/>}
        </div>
        <div id="selected">
            <Selected 
                selected={selected}
                updateSelected={updateSelected}
                removeSelected={removeSelected}
                removeAll={removeAll}/>
        </div>
        <Search select={select} stroke={defaultStrokes[labels.length]} orientation={labels.length & 1 ? "right" : "left"}/>
        </>
    )
}

export default Home;