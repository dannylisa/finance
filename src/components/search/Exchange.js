import React, {useState, useEffect} from 'react';
import {Grid, FormControl, InputLabel, Select, MenuItem, IconButton} from '@material-ui/core';
import { IoAddCircleOutline, IoSwapHorizontalOutline } from 'react-icons/io5';
import { exchangeRate } from 'getdata';
import { ExchangeRateData } from 'objects/Data';

const Exchange = ({select, strokeGenerator, orientation}) => {
    const from = '2015-09-01';
    const today = new Date().format('yyyy-mm-dd');
    const currency = ["USD", "KRW", "CNY", "JPY", "EUR"];
    const [base, setBase]=useState("USD");
    const [symbol, setSymbol]=useState("KRW");
    const menuChange = (event) => {
        if(event.target.name === "exchange-base")
            setBase(event.target.value);
        else if(event.target.name === "exchange-symbol")
            setSymbol(event.target.value);
    };
    const onAddClicked = async () => {
        const fetchedData = await exchangeRate(base, symbol, from, today);
        const ExData = new ExchangeRateData({
                            base,
                            symbol,
                            stroke: strokeGenerator(),
                            orientation
                        })
        ExData.setData(fetchedData);
        select(ExData);
    }

    return(
        <>
        <div className="search-tab-title">
            <b>환율</b>
        </div>
        <Grid container id="exchange-tab">
            <Grid container item xs={12} md={5} justify="center">
                <FormControl className="search-exchange">
                    <InputLabel id="exchange-base-label">Base</InputLabel>
                    <Select
                        labelId="exchange-base-label"
                        name="exchange-base"
                        value={base}
                        onChange={menuChange}>
                        {
                            currency.map( (c, idx) => (
                                <MenuItem key={idx} value={c}>{c}</MenuItem>
                            ))
                        }
                    </Select>
                </FormControl>
            </Grid>
            <Grid item container xs={12} md={1} alignItems="center" justify="center">
                <IoSwapHorizontalOutline size="24"/>
            </Grid>
            <Grid container item xs={12} md={5} justify="center">
                <FormControl className="search-exchange">
                    <InputLabel id="exchange-symbol-label">Symbol</InputLabel>
                    <Select
                        labelId="exchange-symbol-label"
                        value={symbol}
                        name="exchange-symbol"
                        onChange={menuChange}>
                        {
                            currency.map( (c, idx) => (
                                <MenuItem key={idx} value={c}>{c}</MenuItem>
                            ))
                        }
                    </Select>
                </FormControl>
            </Grid>
            <Grid item container xs={12} md={1} alignItems="center" justify="center">
                <IconButton onClick={onAddClicked}>
                    <IoAddCircleOutline/>
                </IconButton>
            </Grid>
        </Grid>
        </>
    )
}

export default Exchange;