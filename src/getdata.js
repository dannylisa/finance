import axios from 'axios';
import { dbService } from 'fbase';
import xml2jsonLtx from 'xml2json-ltx';
import {markets} from 'objects/Sample';

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
        return ['종가', '거래량'];
    }
    if(opts[1]==='재무상태표'){
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

// 재무상태표 opts : 재무상태표 > 자산 > 자산총계
// 손익계산서 opts : 손익계산서 > 영업이익
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

export const stockInfo = async (corp_code, bsns_year, reprt_code) => {
    const api_url = 'https://cors-anywhere.herokuapp.com/http://asp1.krx.co.kr/servlet/krx.asp.XMLSise?code=035420';

    const {data} =  await axios.get(`${api_url}`);
    const options = {object: true};
    const {stockprice : {TBL_StockInfo}} = xml2jsonLtx.toJson(data, options);
    console.log(TBL_StockInfo);
}