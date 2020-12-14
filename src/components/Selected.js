import { Avatar, Chip, Grid, IconButton, ListItemText, Menu, MenuItem } from '@material-ui/core';
import {IoArrowBackSharp, IoArrowForwardSharp, IoCloseCircleOutline, IoHandLeft, IoSquare} from 'react-icons/io5'
import React, {useState} from 'react';
import { BarData, LineData } from 'objects/Data';

const Selected = ({selected, defaultStrokes, updateSelected, removeSelected, removeAll, isDataMixed}) => {
    const ViewSelected = ({data, idx}) => {
        const label = data.label;
        const labelId = label.replace(' ','').replace('/','');
        const stroke = data.stroke;
        const [anchorEl, setAnchorEl] = useState(null);
        const handleClick = (event) => {
            setAnchorEl(event.currentTarget);
        };
        const handleClose = () => {
            setAnchorEl(null);
        };
        const setDataFunctions = (data) => {
            let res = [];
            if(!data.isOriginData){
                res = [...res,{
                        func: () => updateSelected(idx, data.getOriginData()),
                        name:"기존 데이터"
                    }]
            }
            else if(!isDataMixed() && data instanceof BarData){
                res = [...res,(
                    data.type==='line' ? 
                            {func: () => updateSelected(idx, data.toBarData()),
                            name:"Bar Chart"}
                        : {func: () => updateSelected(idx, data.toLineData()),
                            name:"Line Chart"}
                )]
            }
            else if(data instanceof LineData){
                res = [...res, 
                    {
                        func: () => updateSelected(idx, data.getSmoothCurve()),
                        name:"지수이동평균선"
                    },
                    {
                        func: () => updateSelected(idx, data.getMovingAverage(5)),
                        name:"5일 이동평균선"
                    },
                    {
                        func: () => updateSelected(idx, data.getMovingAverage(20)),
                        name:"20일 이동평균선"
                    },
                    {
                        func: () => updateSelected(idx, data.getMovingAverage(50)),
                        name:"50일 이동평균선"
                    },
                    {
                        func: () => updateSelected(idx, data.getMovingAverage(120)),
                        name:"120일 이동평균선"
                    },
                ];
            }
            return res;
        }
        const updateColor = (color)=>{
            updateSelected(idx, data.setStroke(color));
            handleClose();
        }
        const toggleOrientation = () =>{
            updateSelected(idx, data.toggleOrientation());
            handleClose();
        }

        return (
            <div>
                <Chip
                label={label}
                aria-controls={`simple-menu-${labelId}`}
                aria-haspopup="true"
                style={{background: stroke}}
                onClick={handleClick}
                onDelete={()=>{removeSelected(idx)}}/>
                <Menu
                    id={`simple-menu-${labelId}`}
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleClose}>
                        <div className="select-color-box">
                            {
                                defaultStrokes.map((s, idx)=>(
                                    <IconButton key={idx} onClick={()=>updateColor(s)}>
                                        <IoSquare size="26" color={s}/>
                                    </IconButton>
                                ))
                            }
                        </div>
                        <IconButton onClick={toggleOrientation}>
                            { data.orientation==='left' ? 
                                <>To right side&nbsp;<IoArrowForwardSharp/></>
                                :
                                <><IoArrowBackSharp/>&nbsp;To Left Side</>
                            }
                        </IconButton>
                    {setDataFunctions(data).map( ({func, name}, idx) => (
                        <MenuItem key={idx} onClick={()=>{func();handleClose();}}>{name}</MenuItem>
                    ))}
                </Menu>
            </div>
        )
    }
    return(
        <div id="selected">
            <div className="selected-left">
                {
                    selected.map((s, idx)=>(
                        s.orientation === 'left' && <ViewSelected key={idx} data={s} idx={idx}/>
                    ))
                }
            </div>
            <div className="selected-right">
                {
                    selected.map((s, idx)=>(
                        s.orientation === 'right' && <ViewSelected key={idx} data={s} idx={idx}/>
                    ))
                }
            </div>
            {
                selected.length > 0 && 
                <IconButton onClick={removeAll}>
                    <IoCloseCircleOutline/>
                </IconButton>
            }
        </div>
    )
}

export default Selected;