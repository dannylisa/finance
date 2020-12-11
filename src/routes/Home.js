import React, { useState, useEffect } from 'react';
import Search from 'components/Search';
import Selected from 'components/Selected';
import DataChart from 'components/DataChart';

const Home = () => {
    const defaultStrokes = ["#8884d8", "#ff9d44", "#44aaff","#73c96c", "#ff7777","#999999"];
    
    const useSelected = () => {
        const [selected, setSelected] = useState([]);
        const [labels, setLabels] = useState([]);
        const select = (newData) => {
            const MAX_VIEWABLE_DATA = 4;
            const newLabel = newData.label;
            if(labels.includes(newLabel)){
                alert('이미 선택한 데이터입니다!')
                return;
            } else if(labels.length>=MAX_VIEWABLE_DATA){
                alert(`${MAX_VIEWABLE_DATA}개 데이터까지만 비교할 수 있습니다.`);
                return;
            }
            setSelected(prev => [...prev, newData]);
            setLabels(prev => [...prev, newLabel]);
        }
        const updateSelected = (idx, updatedData) => {
            setSelected(prev => {
                prev.splice(idx, 1, updatedData);
                return [...prev];
            });
            setLabels(prev => {
                prev.splice(idx, 1, updatedData.label);
                return [...prev];
            });
        }
        const removeSelected = (idx) => {
            selected[idx].giveDepender();
            setSelected(prev => prev.filter((p, index)=> index!==idx));
            setLabels(prev => prev.filter((p, index)=> index!==idx));
        }
        const removeAll = () => {
            setSelected([]);
            setLabels([]);
        }
        return [selected, labels, select, updateSelected, removeSelected, removeAll];
    }
    const [selected, labels, select, updateSelected, removeSelected, removeAll] = useSelected();

    return(
        <>
        <div style={{height:'400px'}}>
            {selected.length>0 && <DataChart datas={selected} xAxis="date"/>}
        </div>
        <Selected 
            selected={selected}
            select={select}
            defaultStrokes={defaultStrokes}
            updateSelected={updateSelected}
            removeSelected={removeSelected}
            removeAll={removeAll}/>
        <Search 
            select={select} 
            stroke={defaultStrokes[labels.length]} 
            orientation={selected.filter(s=>s.needAxis).length & 1 ? "right" : "left"}/>
        </>
    )
}

export default Home;