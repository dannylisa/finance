import React, { useEffect, useState } from 'react';
import {ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts';
import PropTypes from 'prop-types';
import {Data} from 'objects/Data';

// ["KRW", {2020-12-01:1000, 2020-12-02:1020, 2020-12-03:1030}] 와
// ["CNY", {2020-12-01:6.9, 2020-12-02:7, 2020-12-03:7.1}]을
// [{date:2020-12-01, KRW:1000, CNY:6.9}, {date:2020-12-02, KRW:1020, CNY:7}, {date:2020-12-03, KRW:1030, CNY:7.1}] 로 합성
export const merge = (xAxis, ...name_data_entries) => {
    let res = [];
    let copy_data = name_data_entries.map(([name, data]) => [name, Object.assign({}, data)]);
    copy_data.forEach(([name, data]) => {
        let xList
        try{ 
            xList = Object.keys(data);
        }catch(e){
            xList=[];
        }
        xList.forEach( x => {
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

const DataChart = ({datas, xAxis}) => {
    const [mergedData, setMergedData] = useState([]);
    useEffect(()=> {
        setMergedData( merge(xAxis, ...datas.map( d => [d.yAxis, d.data])) );
    },[datas])
    const yAxisLabel = (name) => ({
        value: name,
        angle: 0,
        offset: -25,
        position: 'insideTop',
        textAnchor: 'middle'
    })
    return( 
    <ResponsiveContainer width="100%">
        <ComposedChart data={mergedData} margin={{top: 30, right: 5, left: 5, bottom: 5}}>
            <XAxis name={xAxis} dataKey={xAxis}/>
            {
                datas.map( (d, idx) => {
                    const {yAxis, orientation} = d;
                    return (
                        <YAxis 
                            key={idx} 
                            name={yAxis}
                            domain={['auto', 'auto']}
                            yAxisId={yAxis} 
                            orientation={orientation} 
                            allowDataOverflow={false}
                            label={yAxisLabel(yAxis)}/>
                            )
                } )
            }
            <CartesianGrid strokeDasharray="5 5"/>
            <Tooltip/>
            <Legend/>
            {
                datas.map( (d, idx) => {
                    let {yAxis, type, stroke} = d;
                    return (
                        type==="line" &&
                        <Line 
                            yAxisId={yAxis}
                            type="monotone" 
                            key={idx}
                            name={yAxis}
                            dataKey={yAxis} 
                            stroke={stroke} 
                            strokeWidth={2} 
                            dot={false} />

                    )
                })
            }
        </ComposedChart>
    </ResponsiveContainer>
    )
}
DataChart.propTypes={
    data: PropTypes.arrayOf(PropTypes.instanceOf(Data)),
    xAxis:PropTypes.string.isRequired
}

export default DataChart;