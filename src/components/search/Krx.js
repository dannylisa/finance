import React, { useEffect, useState } from 'react';
import {Grid, FormControl, TextField, Select, MenuItem, IconButton, Chip, Avatar} from '@material-ui/core';
import { IoAddCircleOutline, IoSearchOutline } from 'react-icons/io5';
import {corpNameAndCode} from 'getdata';
import { krxFinancialStatement } from 'getdata';
import { KrxFSData } from 'objects/Data';

const Krx = ({select, stroke, orientation}) => {
    const [cache, setCache] = useState({});
    // if Is in? return data : not in ? return false
    const getCache = (...opts) => {
        let curr = cache;
        try{
            opts.forEach( opt => {
                curr = curr[opt]
            })
        }catch(e){
            return false;
        }
        return Boolean(curr) ? curr : false;
    }
    const putCache = (data, ...opts) => {
        setCache( prev => {
            let copy = Object.assign({},prev);
            let curr = copy;
            opts.forEach( opt => {
                if(curr[opt])
                    curr = curr[opt];
                else{
                    curr[opt]={}
                    curr = curr[opt];
                }
            })
            Object.assign(curr, data);
            return copy;
        });
    }

    const validAverage = (json) => {
        const arr = Object.values(json).filter(a => a!==0).map(a=>Math.abs(a));
        return arr.length ? arr.reduce((sum, a)=>sum+a, 0)/arr.length : 0;
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

    const optionTree ={
        '종목정보':{},
        '재무제표(연결)':{
            '재무상태표':{},
            '손익계산서':{}
        }
    }
    
    const getOptionsByDir = async opts => {
        let subOptions = {};
        const inCache = getCache(corpCode, ...opts);
        if(inCache){
            return Object.keys(inCache);
        }
        else if(opts[0]==="재무제표(연결)"){
            subOptions = await krxFinancialStatement(corpCode, opts[1]);
            putCache(subOptions, corpCode, opts[0], opts[1])
        }
        return Object.keys(subOptions);
    }
    const getSubOptions = async (...opts) => {
        if(opts.length === 0)
            return Object.keys(optionTree)

        let curr = optionTree;
        for(let i=0; i<opts.length-1; i++){
            curr = curr[opts[i]]
        }
        try{
            const res=Object.keys(curr[ opts[opts.length-1] ])
            if(res.length)
                return res;
            else throw Error('');
        }catch(e){
            return await getOptionsByDir(opts);
        }
    }
    //옵션을 크기 순서대로 나열
    //손익계산서의 경우의 영업이익 > 연간과 같이 2개의 depth를 들어가서 정렬을 해야 하므로
    //finalOption인자 또한 추가했다.
    const orderOptionsByAverage = (finalOpts, ...opts) => {
        return finalOpts
            .map( opt => [opt, validAverage(getCache(corpCode, ...opts, opt))])
            .sort(([optA, valA], [optB, valB]) => valB - valA)
            .map(([opt, val]) => opt);
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
            setOptionList2( optionDepth===2 ? resOptions : orderOptionsByAverage(resOptions, opt1));
        })();
    }, [opt1])
    useEffect(()=> {
        (async () => {
            if(opt2==='' || optionDepth<3)
                return;

            const resOptions = await getSubOptions(opt1, opt2);
            if(opt2==='손익계산서'){
                setOptionList3(
                    resOptions
                        .map( opt => [opt, validAverage(getCache(corpCode, opt1, opt2, opt, '연간'))])
                        .sort(([optA, valA], [optB, valB]) => valB - valA)
                        .map(([opt, val]) => opt) 
                );
            }
            else{
                setOptionList3( optionDepth===3 ? resOptions : orderOptionsByAverage(resOptions, opt1, opt2));  
            }
        })();
    }, [opt2])
    useEffect(()=>{
        (async () => {
            if(opt3==='' || optionDepth<4)
                return;
            const resOptions = await getSubOptions(opt1, opt2, opt3);
            setOptionList4( orderOptionsByAverage(resOptions, opt1, opt2, opt3));  
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
    const onAddButtonClicked = () => {
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
        KrxData.setData(getCache(corpCode, ...necessaryOpts))
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