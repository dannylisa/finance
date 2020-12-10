import { Chip, IconButton, Menu, MenuItem } from '@material-ui/core';
import {IoCloseCircleOutline} from 'react-icons/io5'
import React, {useState} from 'react';
import { ExchangeRateData } from 'objects/Data';

const Selected = ({selected, updateSelected, removeSelected, removeAll}) => {
    const ViewSelected = ({data, idx}) => {
        const label = data.putLabel();
        const stroke = data.stroke;
        const [anchorEl, setAnchorEl] = useState(null);
        const handleClick = (event) => {
            setAnchorEl(event.currentTarget);
        };
        const handleClose = () => {
            setAnchorEl(null);
        };
        const setDataFunctions = (data) => {
            if(data instanceof ExchangeRateData){
                return [
                    {func: () => {
                        updateSelected(idx, data.setSmoothCurve());
                    }, name:"지수이동평균선"}
                ];
            }
        }

        return (
            <div>
                <Chip
                label={label}
                aria-controls={`simple-menu-${label.replace(' ','').replace('/','')}`}
                aria-haspopup="true"
                style={{background: stroke}}
                onClick={handleClick}
                onDelete={()=>{removeSelected(idx)}}/>
                <Menu
                    id={`simple-menu-${label.replace(' ','').replace('/','')}`}
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleClose}>
                    {setDataFunctions(data).map( ({func, name}, idx) => (
                        <MenuItem key={idx} onClick={()=>{func();handleClose();}}>{name}</MenuItem>
                    ))}
                </Menu>
            </div>
        )
    }
    return(
        <>
        {
            selected.map((s, idx)=>(
                <ViewSelected key={idx} data={s} idx={idx}/>
            ))
        }
        {
            selected.length > 0 && 
            <IconButton onClick={removeAll}>
                <IoCloseCircleOutline/>
            </IconButton>
        }
        </>
    )
}

export default Selected;