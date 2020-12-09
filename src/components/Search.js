import React, {useState} from 'react';
import {Paper, Chip} from '@material-ui/core';
import Exchange from 'components/search/Exchange';
import 'components/Search.css'

const Search = ({select, stroke, orientation}) => {
    const [tab, setTab] = useState("환율");
    const list = ["환 율", "국내 기업"];
    const renderSearchComponent = () => {
        switch (tab) {
            case "환 율":
                return <Exchange select={select} orientation={orientation} stroke={stroke}/>
                break;
        
            default:
                return <></>;
                break;
        }
    }
    return(
        <Paper variant="elevation" elevation={2}>
            <div id="search-select">
                {
                    list.map((name, idx)=> (
                        <Chip
                            key={idx}
                            label={name}
                            onClick={()=>setTab(name)}
                            clickable
                            color="primary"
                        />
                    ))
                }
            </div>
            <div id="search-tab">
                {renderSearchComponent()}
            </div>
        </Paper>
    )
}

export default Search;