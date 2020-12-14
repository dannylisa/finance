import React, { useState, useEffect } from 'react';
import Search from 'components/Search';
import Selected from 'components/Selected';
import DataChart from 'components/DataChart';
import { LineData, BarData } from 'objects/Data';
import Recommend from 'components/Recommend';
import { krxStockInfo } from 'getdata';

const Home = () => {
    const defaultStrokes = ["#8884d8", "#ff9d44", "#44aaff","#73c96c", "#d4af37", "#ff7777", "#aaaaaa"];
    const [strokeGenerator, setStrokeGenerator] = useState(()=> ()=>{});
    useEffect(()=>{
        function* strokeGenerator(){
            let i=0;
            while(true){
                i%=defaultStrokes.length;
                yield defaultStrokes[i];
                i++;
            }
        }
        const generator = strokeGenerator();
        setStrokeGenerator(prev => (() => generator.next().value));
    },[])
    
    
    const [countSelected, setCountSelected] = useState(0);
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
            setCountSelected(prev=>prev+1);
        }
        const updateSelected = (idx, updatedData) => {
            if(labels.includes(updatedData.label) && labels[idx]!==updatedData.label){
                alert('이미 선택되어있는 데이터입니다!')
                return;
            }
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
            setSelected(prev => prev.filter((p, index)=> index!==idx));
            setLabels(prev => prev.filter((p, index)=> index!==idx));
            setCountSelected(prev=>prev-1);
        }
        const removeAll = () => {
            setSelected([]);
            setLabels([]);
            setCountSelected(0);
        }
        const isDataMixed = () => (
            !selected.every( s => s instanceof BarData)
            && !selected.every( s => s instanceof LineData)
        );
        useEffect(()=>{
            if(isDataMixed()){
                setSelected(prev => {
                    return prev.map( s => {
                        return s instanceof BarData ? s.toStairData() : s
                    })
                })
            }
            else{
                if(countSelected>1){
                    setSelected(prev => {
                        return prev.map( s => {
                            return s instanceof BarData ? s.toLineData() : s
                        })
                    })
                }
                else{
                    setSelected(prev => {
                        return prev.map( s => {
                            return s instanceof BarData ? s.getOriginData().toBarData() : s
                        })
                    })
                }
            }
        }, [countSelected])
        return [selected, select, updateSelected, removeSelected, removeAll, isDataMixed];
    }
    const [selected, select, updateSelected, removeSelected, removeAll, isDataMixed] = useSelected();

    return(
        <>
        
            {selected.length>0 
                ? <DataChart datas={selected} xAxis="date"/>
                : <div style={{minHeight:'450px'}}/>}
        <Selected 
            selected={selected}
            defaultStrokes={defaultStrokes}
            updateSelected={updateSelected}
            removeSelected={removeSelected}
            removeAll={removeAll}
            isDataMixed={isDataMixed}/>
        <Search 
            select={select} 
            strokeGenerator={strokeGenerator} 
            orientation={
                selected.length ?
                    (selected[selected.length-1].orientation==='left' ? "right" : "left")
                :
                    'left'
            }/>
        <Recommend/>
        </>
    )
}

export default Home;