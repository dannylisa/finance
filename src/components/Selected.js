import { Chip } from '@material-ui/core'
import React, {useEffect} from 'react';
import { merge } from 'components/DataChart';

const Selected = ({selected, labels, removeSelected}) => {
    const ViewSelected = ({stroke, label, idx}) => {
        return (
            <Chip
                label={label}
                style={{background: stroke}}
                onDelete={()=>{removeSelected(idx)}}
            />
        )
    }
    return(
        <>
        {
            selected.map((s, idx)=>(
                <ViewSelected key={idx} stroke={s.stroke} label={s.putLabel()} idx={idx}/>
            ))
        }
        </>
    )
}

export default Selected;