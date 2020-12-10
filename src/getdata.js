import axios from 'axios';
import { dbService } from 'fbase';
import xml2jsonLtx from 'xml2json-ltx';
import {markets, Samsung} from 'objects/Sample';

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
export const krxFinancialStatement = async (corp_code, type) => {
    if(type!=="재무상태표" && type!=="손익계산서")
        return;
    const {docs} = await dbService.collection(`krx/corps/${corp_code}/재무제표(연결)/${type}`).get();
    return docs[0].data();
}

export const stockInfo = async (corp_code, bsns_year, reprt_code) => {
    const api_url = 'https://cors-anywhere.herokuapp.com/http://asp1.krx.co.kr/servlet/krx.asp.XMLSise?code=035420';

    const {data} =  await axios.get(`${api_url}`);
    const options = {object: true};
    const {stockprice : {TBL_StockInfo}} = xml2jsonLtx.toJson(data, options);
    console.log(TBL_StockInfo);
}