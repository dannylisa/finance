import axios from 'axios';
export const exchangeRate = async (base, symbol, start, end) => {
    const api_url = "https://api.exchangeratesapi.io";
    const { 
        data: { rates }
     } = await axios.get(`${api_url}/history?base=${base}&symbols=${symbol}&start_at=${start}&end_at=${end}`);
    let res = {};
    Object.entries(rates).map( ([date, rate]) => res[date] = rate[symbol] );
    return res;
}