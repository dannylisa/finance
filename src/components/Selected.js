import { Avatar, Chip, Grid, IconButton, ListItemText, Menu, MenuItem } from '@material-ui/core';
import {IoArrowBackSharp, IoArrowForwardSharp, IoCloseCircleOutline, IoHandLeft, IoSquare} from 'react-icons/io5'
import React, {useState} from 'react';
import { DailyData } from 'objects/Data';

const Selected = ({selected, select, defaultStrokes, updateSelected, removeSelected, removeAll}) => {
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
            if(!data.isOrigin)
                return res;
            if(data instanceof DailyData){
                res = [...res, 
                    {
                        func: () => select(data.getSmoothCurve()),
                        name:"지수이동평균선"
                    },
                    {
                        func: () => select(data.getMovingAverage(20)),
                        name:"20일 이동평균선"
                    },
                    {
                        func: () => select(data.getMovingAverage(50)),
                        name:"50일 이동평균선"
                    },
                    {
                        func: () => select(data.getMovingAverage(120)),
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