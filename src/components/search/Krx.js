import React, { useEffect, useState } from 'react';
import {Grid, FormControl, TextField, Select, MenuItem, IconButton, Chip, Avatar} from '@material-ui/core';
import { IoAddCircleOutline, IoSearchOutline } from 'react-icons/io5';
import {corpNameAndCode} from 'getdata';
import { krxOptions, krxFinancialStatement } from 'getdata';
import { KrxFSData } from 'objects/Data';

const Krx = ({select, stroke, orientation}) => {
    const initialOptionTree ={
        '종목정보':{},
        '재무제표(연결)':{
            '재무상태표':{
                '자산':{},
                '자본':{},
                '부채':{},
            },
            '손익계산서':{}
        }
    }
    const [cache, setCache] = useState({});
    // if Is in? return data : not in ? return false
    const getCache = (...opts) => {
        if(cache[opts[0]] === undefined)
            putCache(initialOptionTree, opts[0])
        let curr = cache;
        try{
            opts.forEach( opt => {
                curr = curr[opt]
            })
            if(Object.keys(curr).length==0)
                return false;
        }catch(e){
            return false;
        }
        return curr;
    }

    const putCache = (data, ...opts) => {
        setCache( prev => {
            let curr = prev;
            opts.forEach( opt => {
                if(curr[opt]===undefined)
                    curr[opt]={}
                curr = curr[opt];
            })
            Object.assign(curr, data);
            return {...prev};
        });
    }

//////////////////////////////////////////////////////////
                // useOptions //
//////////////////////////////////////////////////////////
    const useOption = (initialOptionList) => {
        const [optionList, setOptionList] = useState(initialOptionList);
        const [opt, setOpt] = useState('');
        const [visible, setVisible] = useState(false);
        useEffect(()=>{
            optionList.length ? setOpt(optionList[0]) : setOpt('');
        },[optionList])
        return [optionList, opt, visible, setOptionList, setOpt, setVisible];
    }

    const [searchValue, setSearchValue] = useState("");
    const [corpName, setCorpName] = useState("");
    const [corpCode, setCorpCode] = useState("");
    const [optionDepth, setOptionDepth] = useState(0);
    const [optionList1, opt1, visible1, setOptionList1, setOpt1, setVisible1] = useOption([]);
    const [optionList2, opt2, visible2, setOptionList2, setOpt2, setVisible2] = useOption([]);
    const [optionList3, opt3, visible3, setOptionList3, setOpt3, setVisible3] = useOption([]);
    const [optionList4, opt4, visible4, setOptionList4, setOpt4, setVisible4] = useOption([]);

    useEffect(()=>{
        const visible = [setVisible1,setVisible2,setVisible3,setVisible4]
        visible.forEach( (v, idx) => {
                idx<optionDepth ? v(true) : v(false);
            })
    },[optionDepth])

    const getSubOptions = async (...opts) =>{
        const inCache = getCache(corpCode, ...opts);
        if(inCache)
            return Object.keys(inCache);
        else{
            const options = await krxOptions(corpCode, ...opts);
            putCache(options.reduce((json, opt)=>{
                json[opt]={}
                return json;
            }, {}),corpCode,...opts);
            return options;
        }
    }
    
    useEffect(() => {
        if(corpCode==='')
            return
        setVisible1(true);
        setOptionList1(["종목정보", "재무제표(연결)"]);
    }, [corpCode])

    useEffect(()=>{
        (async () => {
            if(opt1==='')
                return
            // 종목정보 height : 2
            else if (opt1==="종목정보"){
                setOptionDepth(2);
            }
            // 재무제표 height : 4
            else if (opt1==="재무제표(연결)"){
                setOptionDepth(4)
            }
            const resOptions = await getSubOptions(opt1);
            setOptionList2(resOptions);
        })();
    }, [opt1])
    useEffect(()=> {
        (async () => {
            if(opt2==='' || optionDepth<3)
                return;

            const resOptions = await getSubOptions(opt1, opt2);
            setOptionList3(resOptions);  
        })();
    }, [opt2])
    useEffect(()=>{
        (async () => {
            if(opt3==='' || optionDepth<4)
                return;
            const resOptions = await getSubOptions(opt1, opt2, opt3);
            setOptionList4(resOptions);  
        })();
    }, [opt3])

//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
    const [market, setMarket] = useState({KOSPI:[], KOSDAQ:[]})
    const [searchResults, setSearchResults] = useState([]);
    useEffect(()=>{
        const [KOSPI, KOSDAQ] = corpNameAndCode();
        setMarket({
            KOSPI, KOSDAQ
        });
    }, [])
    const onChangeSearchCorp = (keyword) => {
        setSearchValue(keyword);
        keyword=keyword.toLowerCase();
        if(keyword.length<2)
            return;
        let res=[];
        market.KOSPI.forEach(([name, code])=>{
            if(name.toLowerCase().includes(keyword) || code.includes(keyword))
                res=[...res, [name,code,0]];
        })
        market.KOSDAQ.forEach(([name, code])=>{
            if(name.toLowerCase().includes(keyword) || code.includes(keyword))
                res=[...res, [name,code,1]];
        })
        setSearchResults(res);
    }
    const menuChange = (event) => {
        const name = event.target.name;
        const menuNum = parseInt(name[name.length-1]);
        [setOpt1, setOpt2, setOpt3, setOpt4][menuNum-1](event.target.value);
    };
    const onAddButtonClicked = async () => {
        let item ='';
        if(opt2 === '재무상태표')
            item = opt4;
        else if(opt2 === '손익계산서')
            item = `${opt3}(${opt4})`;
        else
            item = [opt1, opt2, opt3, opt4][optionDepth-1];
        const KrxData = new KrxFSData({
            corpName,
            item,
            stroke,
            orientation
        })
        const necessaryOpts = [opt1, opt2, opt3, opt4].filter((o, idx)=>idx<optionDepth)
        const inCache = getCache(corpCode, ...necessaryOpts);
        if(inCache){
            KrxData.setCacheData(inCache);
        }
        else {
            let data={};
            if(opt1==='재무제표(연결)'){
                if (opt2=='재무상태표') {
                    data = await krxFinancialStatement(corpCode, '재무상태표', opt3, opt4);
                    putCache(data, corpCode, opt1, opt2, opt3, opt4);
                    KrxData.setCacheData(data);
                }
                else if (opt2=='손익계산서') {
                    data = await krxFinancialStatement(corpCode, '손익계산서', opt3);
                    putCache(data, corpCode, opt1, opt2, opt3);
                    KrxData.setCacheData(data[opt4]);
                }
            }
        }
        select(KrxData);
    }
    
    return (
        <>
        <div className="search-tab-title">
            <b>국내 기업</b>
        </div>
        <Grid container id="krx-tab">
            <Grid container item xs={12} md={3} justify="center">
                <Grid item xs={9}>
                    <FormControl fullWidth>
                        <TextField 
                            onChange={(event)=>onChangeSearchCorp(event.target.value)}
                            value={searchValue}
                            label="회사명"
                            variant="outlined"/>
                    </FormControl>
                </Grid>
                <Grid container item xs={3} alignItems="center" justify="center">
                    <IconButton>
                        <IoSearchOutline/>
                    </IconButton>
                </Grid>
            </Grid>
            <Grid container item xs={12} md={8} alignItems="center" spacing={2}>
           {visible1 && 
            <Grid container item xs={6} md={3} justify="center">
               <FormControl  fullWidth className="search-krx">
                    <Select
                        value={opt1}
                        name="krx-opt1"
                        onChange={menuChange}>
                        {
                            optionList1.map( (c, idx) => <MenuItem key={idx} value={c}>{c}</MenuItem> )
                        }
                    </Select>
                </FormControl>
            </Grid>
            }
            { visible2 && 
            <Grid container item xs={6} md={3} justify="center">
                <FormControl fullWidth className="search-krx">
                    <Select
                        value={opt2}
                        name="krx-opt2"
                        onChange={menuChange}>
                        {
                            optionList2.map( (c, idx) => <MenuItem key={idx} value={c}>{c}</MenuItem> )
                        }
                    </Select>
                </FormControl>
            </Grid>
            }
            { visible3 && 
            <Grid container item xs={6} md={3} justify="center">
                <FormControl fullWidth className="search-krx">
                    <Select
                        value={opt3}
                        name="krx-opt3"
                        onChange={menuChange}>
                        {
                            optionList3.map( (c, idx) => <MenuItem key={idx} value={c}>{c}</MenuItem> )
                        }
                    </Select>
                </FormControl>
            </Grid>
            }
            { visible4 && 
            <Grid container item xs={6} md={3} justify="center">
                <FormControl fullWidth className="search-krx">
                    <Select
                        value={opt4}
                        name="krx-opt4"
                        onChange={menuChange}>
                        {
                            optionList4.map( (c, idx) => <MenuItem key={idx} value={c}>{c}</MenuItem> )
                        }
                    </Select>
                </FormControl>
            </Grid>}
            </Grid>

            <Grid item container xs={12} md={1} alignItems="center" justify="center">
                <IconButton onClick={onAddButtonClicked}>
                    <IoAddCircleOutline/>
                </IconButton>
            </Grid>
        </Grid>
        <div className="searched-corps">
            {
                searchResults.map((res, idx)=>(
                    <Chip
                        key={idx}
                        avatar={<Avatar>{res[2] ? "닥" : "코"}</Avatar>}
                        label={`${res[0]} ${res[1]}`}
                        style={{background: res[2] ? "#ffddee" : "#ddeeff"}}
                        onClick={()=>{
                            setCorpName(res[0]);
                            setSearchValue(res[0]);
                            setCorpCode(res[1]);
                            setSearchResults([]);
                        }}
                    />
                ))
            }
        </div>
        </>
    );
}

export default Krx;