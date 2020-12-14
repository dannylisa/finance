import axios from 'axios';
import { dbService } from 'fbase';
import xml2jsonLtx from 'xml2json-ltx';
import {markets} from 'objects/Sample';
import cheerio from 'cheerio'
import { element } from 'prop-types';

export const exchangeRate = async (base, symbol, start, end) => {
    const api_url = "https://api.exchangeratesapi.io";
    const { 
        data: { rates }
     } = await axios.get(`${api_url}/history?base=${base}&symbols=${symbol}&start_at=${start}&end_at=${end}`);
    let res = {};
    Object.entries(rates).map( ([date, rate]) => res[date] = rate[symbol] );
    return res;
}

export const corpNameAndCode = () => {
    const kospi = Object.entries(markets.KOSPI);
    const kosdaq = Object.entries(markets.KOSDAQ);
    return [kospi, kosdaq];
}
export const krxOptions = async (corp_code, ...opts) =>{
    if(opts[0]==='종목정보'){
        return ['주가', '거래량'];
    }
    else if(opts[0]==='재무비율'){
        return krxFinancialRatioOptions;
    }
    else if(opts[1]==='재무상태표'){
        if(opts.length===2)
            return ['자산','자본','부채'];
        const dbOptions = await dbService
                                .collection(`krx/corps/${corp_code}/재무제표(연결)/재무상태표`)
                                .doc(opts[2])
                                .get();
        return dbOptions.data().accounts;
    }
    else if(opts[1]==='손익계산서'){
        if(opts.length===3)
            return opts[2] ? ['분기','연간'] : [];
        else{
            const dbOptions = await dbService
                                    .collection(`krx/corps/${corp_code}/재무제표(연결)/손익계산서`)
                                    .doc('accounts')
                                    .get();
            const result = dbOptions.data();
            return Boolean(result) ? result.accounts : [];
        }
    }
}

// 재무상태표 opts : 재무상태표 , 자산 , 자산총계
// 손익계산서 opts : 손익계산서 , 영업이익
export const krxFinancialStatement = async (corp_code, ...opts) => {
    if(opts[0]!=="재무상태표" && opts[0]!=="손익계산서")
        return;
    if(opts[0]==='재무상태표'){
        const {docs} = await dbService.collection(`krx/corps/${corp_code}/재무제표(연결)/재무상태표/${opts[1]}/${opts[2]}`).get();
        return docs[0].data();
    }
    else if(opts[0]==='손익계산서'){
        const {docs} = await dbService.collection(`krx/corps/${corp_code}/재무제표(연결)/손익계산서/accounts/${opts[1]}`).get();
        return docs[0].data();
    }
}

export const krxFinancialRatioOptions = [
    '유동비율', '부채비율','자본잠식률','자기자본이익률(ROE)[연간]','자기자본이익률(ROE)[분기]'
];
export const krxFinancialRatio = async (corp_code, item) => {
    const getRatioData = (operator, operand, ...operands) => {
        let res = {};
        Object.entries(operand).forEach(([key, value])=>{
            res[key] = operator( value, ...operands.map( op => op[key]));
        })
        return res;
    }
    const checkAllDataValid = (...operands) => (
        operands.every(op => Boolean(op) && Object.keys(op).length)
    )
    switch (item) {
        case '유동비율':{
            const 유동자산 = await krxFinancialStatement(corp_code, '재무상태표', '자산', '유동자산');
            const 유동부채 = await krxFinancialStatement(corp_code, '재무상태표', '부채', '유동부채');
            return checkAllDataValid(유동자산, 유동부채) ? 
                getRatioData( (a, b) => 100*a/b , 유동자산, 유동부채) : {};
        }
        case '부채비율':{
            const 유동부채 = await krxFinancialStatement(corp_code, '재무상태표', '부채', '유동부채');
            const 자본총계 = await krxFinancialStatement(corp_code, '재무상태표', '자본', '자본총계');
            return checkAllDataValid(유동부채, 자본총계) ? 
                getRatioData( (a, b) => 100*a/b , 유동부채, 자본총계) : {};
        }
        case '자본잠식률':{
            const 자본총계 = await krxFinancialStatement(corp_code, '재무상태표', '자본', '자본총계');
            const 자본금 = await krxFinancialStatement(corp_code, '재무상태표', '자본', '자본금');
            return checkAllDataValid(자본총계, 자본금) ? 
                getRatioData( (a, b) => a<b ? 100*(1 - a / b)  : 0 , 자본총계, 자본금) : {};
        }
        case '자기자본이익률(ROE)[연간]':{
            const 당기순이익 = (await krxFinancialStatement(corp_code, '손익계산서', '당기순이익'))['연간'];
            const Capital = (await krxFinancialStatement(corp_code, '재무상태표', '자본', '자본총계'));
            const latest = Object.keys(당기순이익).sort().reverse()[0];
            const 자본총계 = { };
            for(let key in Capital)
                if(key.includes('_4Q') || key===latest)
                    자본총계[key.replace('_4Q','')] = Capital[key];

            return checkAllDataValid(당기순이익, 자본총계) ? 
                getRatioData( (a, b) => 100*a/b, 당기순이익, 자본총계 ) : {};
        }
        case '자기자본이익률(ROE)[분기]':{
            const 당기순이익 = (await krxFinancialStatement(corp_code, '손익계산서', '당기순이익'))['분기'];
            const 자본총계 = await krxFinancialStatement(corp_code, '재무상태표', '자본', '자본총계');
            return checkAllDataValid(당기순이익, 자본총계) ? 
                getRatioData( (a, b) => 100*a/b, 당기순이익, 자본총계 ) : {};
        }
        default:
            break;
    }
}

export const krxStockInfo = async(corp_code, item) => {
    const getData = async () => {
        const count = 1300;
        // const api_url=`https://cors-anywhere.herokuapp.com/https://fchart.stock.naver.com/sise.nhn?symbol=${corp_code}&timeframe=day&count=${count}&requestType=0`;
        const api_url=`https://fchart.stock.naver.com/sise.nhn?symbol=${corp_code}&timeframe=day&count=${count}&requestType=0`;
        const {data} = await axios.get(api_url);
        const {protocol:{chartdata:{item}}} = xml2jsonLtx.toJson(data, {object: true});
        return item.map(i=>i.data);
    }
    const rows = await getData();
    const res = {};
    if(item==='주가' || item==='거래량'){
        const itemIndex = item==='주가' ? 1 : 5;
        rows.forEach( row => {
            const values = row.split('|');
            res[ values[0].replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') ] = parseInt(values[itemIndex]);
        })
    }
    return res;
}
export const latestStockInfo = async (corp_code) => {
    // const api_url = `https://cors-anywhere.herokuapp.com/http://asp1.krx.co.kr/servlet/krx.asp.XMLSise?code=${corp_code}`;

    // const {data} =  await axios.get(api_url);
    // const options = {object: true};
    // const {stockprice} = xml2jsonLtx.toJson(data, options);
    // console.log(stockprice);
}