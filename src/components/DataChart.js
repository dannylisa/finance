import React, { useEffect, useState } from 'react';
import {ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts';
import PropTypes from 'prop-types';
import {Data, ExchangeRateData, KrxCorpData, KrxStockData} from 'objects/Data';
import { Chip, TextField, Grid, Checkbox } from '@material-ui/core';
import Slider from 'components/Slider';

// ["KRW", {2020-12-01:1000, 2020-12-02:1020, 2020-12-03:1030}] 와
// ["CNY", {2020-12-01:6.9, 2020-12-02:7, 2020-12-03:7.1}]을
// [{date:2020-12-01, KRW:1000, CNY:6.9}, {date:2020-12-02, KRW:1020, CNY:7}, {date:2020-12-03, KRW:1030, CNY:7.1}] 로 합성
const setUnit = (data) => {
    if(!data.needUnit)
        return
    
    const values = Object.values(data.data);
    const average = values.length ? values.reduce((sum, value) => sum+value, 0)/values.length : 0;
    let unit = average > 50000 ? Math.floor( (average.toString().length - 5 ) / 3)*3 : 0;
    unit = unit >= 15 ? 15 : unit;
    const setDataUnit = (name, unit) => {
        data.setUnit(`(단위: ${name})`);
        for(let key in data.data){
            data.data[key]=parseFloat((data.data[key]/unit).toFixed(2));
        }
    }
    switch(unit){
        case 3: setDataUnit('천',1000); break;
        case 6: setDataUnit('백만',1000000); break;
        case 9: setDataUnit('십억',1000000000); break;
        case 12: setDataUnit('조',1000000000000); break;
        case 15: setDataUnit('천조',1000000000000000); break;
    }
}
const merge = (xAxis, from, ...name_data_entries) => {
    let res = [];
    let copy_data = name_data_entries.map(([name, data]) => [name, Object.assign({}, data)]);
    copy_data.forEach(([name, data]) => {
        let xList;
        try{ 
            xList = Object.keys(data);
        }catch(e){
            xList=[];
        }
        xList.forEach( x => {
            if(x < from) return;
            let obj = {[xAxis]: x};
            copy_data.forEach( ([n, dt]) => {
                if( x in dt){
                    obj[n] = dt[x];
                    delete dt[x];
                }
            })
            res=[...res, obj];
        })
    })
    return res.sort( (m, n) => m[xAxis]  > n[xAxis] ? 1 : -1);;
}
const recommendIntegratedAxisName = (datas) => {
    const isAllTypeOf = (dataClass) => datas.every(data => data instanceof dataClass); 
    const isAllAnyTypeOf = (...dataClasses) => datas.every(data => dataClasses.some(dataClass => data instanceof dataClass)); 
    const hasAllSameMember = (getter) => datas.every(data => getter(data) === getter(datas[0])) ? getter(datas[0]) : '';
    let res = '';
    if(isAllTypeOf(ExchangeRateData)){
        if(res = hasAllSameMember(data => data.symbol)) return res;
        else if(res = hasAllSameMember(data => data.base)) return res;
        else return '환율';
    }
    else if(isAllAnyTypeOf(KrxStockData, KrxCorpData)){
        if(res = hasAllSameMember(data => data.corpName)) return res;
        else if(res = hasAllSameMember(data => data.item)) return res;
        else return '';
    }
    else 
        return console.log(isAllTypeOf(KrxCorpData));
}

const DataChart = ({datas, xAxis}) => {
    const defaultIntegrated = {state: false, name:''}
    const [integrated, setIntegrated] = useState({left:defaultIntegrated, right:defaultIntegrated});
    const [mergedData, setMergedData] = useState([]);
    const [from, setFrom] = useState('');
    const befores = [15, 30, 90, 181, 372, 365, 547, 730, 911, 1096, 1277, 1461, 1826, 3653].reverse();
    const [sliderValue, setSliderValue] = useState(befores.length-1);
    const getSideOf = (orientation) => datas.filter(data => data.orientation===orientation);
    const canIntegrate = (orientation) => getSideOf(orientation).length>=2 ;
    const setIntegratedDefault = (orientation) => setIntegrated(prev => {
        prev[orientation]=defaultIntegrated;
        return {...prev};
    });
    const toggleIntegrated = (orientation) => {
        if(!integrated[orientation].state){
            let name;
            while (true){
                name = window.prompt('통합될 축의 이름을 설정해주세요.', recommendIntegratedAxisName(getSideOf(orientation)));
                if(name===null)
                    return;
                else if(name==='')
                    alert('축의 이름을 입력해주세요.')
                else if(name === integrated[orientation==='right' ? 'left' : 'right'].name)
                    alert(`${orientation==='right' ? '좌측' : '우측'} 축의 이름과 중복됩니다.`)
                else
                    break;
            } 
            setIntegrated(prev => {
                prev[orientation]={
                    state:true,
                    name
                };
                return {...prev}
            });
        }
        else{
            setIntegrated(prev => {
                prev[orientation]={
                    state:false,
                    name:''
                };
                return {...prev}
            });
        }   
    }
    const setFromBefore = (days) =>{
        if(!days) return setFrom('1980-01-01');
        const date = new Date().addDate(-days).format('yyyy-mm-dd');
        setFrom(date);
    }
    useEffect(()=> {
        getSideOf('left').length<2 && setIntegratedDefault('left');
        getSideOf('right').length<2 && setIntegratedDefault('right');
        datas.forEach(data => setUnit(data));
        setMergedData( merge(xAxis, from, ...datas.map( d => [d.yAxis, d.data])) );
    },[datas, from])
    const yAxisLabel = (name, index) => ({
        value: name,
        angle: 0,
        offset: [-25,-40][index],
        position: ['insideTop','insideBottom'][index],
        textAnchor: 'middle'
    })

    return( 
        <>
    <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={mergedData} margin={{top: 30, right: 2, left: 2, bottom: 5}}>
            <XAxis name={xAxis} dataKey={xAxis}/>
            {
                ['left','right'].map( (orientation, idx) => {
                    const {state, name} = integrated[orientation];
                    return state &&
                        <YAxis
                        key={idx}
                        name={name}
                        domain={['auto', 'auto']}
                        yAxisId={name}
                        orientation={orientation}
                        label={yAxisLabel(name, 0)}/>
                })
            }
            {(()=>{
                let indexes = {left:-1, right:-1};
                return datas.map( (d, idx) => {
                    const {yAxis, orientation} = d;
                    indexes[orientation]++;
                    return (
                        !integrated[orientation].state &&
                        <YAxis 
                            key={idx+100} 
                            name={yAxis}
                            domain={['auto', 'auto']}
                            yAxisId={yAxis} 
                            orientation={orientation}
                            label={yAxisLabel(yAxis, indexes[orientation])}/>
                        )
                })
            })()}
            <CartesianGrid strokeDasharray="5 5"/>
            <Tooltip/>
            <Legend/>
            {
                datas.map( (d, idx) => {
                    let {yAxis, type, stroke, unit, orientation} = d;
                    const {state, name} = integrated[orientation];
                    switch (type) {
                        case "line":
                            return (
                                <Line 
                                    yAxisId={state ? name : yAxis}
                                    type="monotone" 
                                    key={idx}
                                    name={yAxis}
                                    dataKey={yAxis} 
                                    stroke={stroke} 
                                    strokeWidth={2} 
                                    unit={unit}
                                    dot={false} />
                            )
                        case "bar":
                            return (
                                <Bar
                                    yAxisId={state ? name : yAxis}
                                    key={idx}
                                    name={yAxis}
                                    dataKey={yAxis}
                                    unit={unit}
                                    fill={stroke} />
                            )
                        default:
                            return <></>;
                    }   
                })
            }
        </ComposedChart>
    </ResponsiveContainer>
    <div className="chart-control-btns">
        <div className='integrate'>
            {canIntegrate('left') && 
                <Chip
                    onClick={()=>toggleIntegrated('left')}
                    label={integrated.left.state ? '축 분리': '축 모아보기'}/>
            }
        </div>
        <div className="period-btns">
            <Grid container  spacing={3}>
                <Grid container item xs={12} md={6}className="period-selector" spacing={3} style={{padding:'2px'}}>
                    <Grid item xs={6} md={7} container alignItems="center">
                        <Slider
                            value={sliderValue}
                            step={1}
                            track="inverted"
                            min={0}
                            max={befores.length-1}
                            onChange={(event, newValue)=>{
                                setFromBefore(befores[newValue])
                                setSliderValue(newValue)
                            }}/>
                    </Grid>
                    <Grid item xs={6} md={5} container alignItems="center">
                        <TextField
                            fullWidth
                            id="date"
                            type="date"
                            value={from}
                            onChange={({target:{value}})=> setFrom(value)}/>
                    </Grid>
                </Grid>
                <Grid container item xs={12} md={6} className="select-period-btns" alignItems="center">
                    {[
                        [30, '1M'],[91, '3M'],[365, '1Y'],[0, '전체'],
                    ].map(([day, label]) => (
                        <Grid item xs={3} key={day}>
                            <Chip
                                onClick={()=>setFromBefore(day)} 
                                label={label}/>
                        </Grid>
                    ))}
                </Grid>
            </Grid>
        </div>
        <div className='integrate'>
            {canIntegrate('right') && 
                <Chip
                    onClick={()=>toggleIntegrated('right')}
                    label={integrated.right.state ? '축 분리': '축 모아보기'}/>
            }
        </div>
    </div>
    </>
    )
}
DataChart.propTypes={
    data: PropTypes.arrayOf(PropTypes.instanceOf(Data)),
    xAxis:PropTypes.string.isRequired
}

export default DataChart;