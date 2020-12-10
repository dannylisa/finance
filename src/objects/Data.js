import { exchangeRate } from 'getdata';
export class Data {
    constructor({type, yAxis, stroke, orientation}) {
        this.data = {};
        this.type = type || "line";
        this.yAxis = yAxis;
        this.stroke = stroke;
        this.orientation = orientation || "left";
    }
    setData = function(newData){
        this.data = newData;
        return this;
    }
    setSubData = function(subdata){
        this.subdata = Object.assign({},this.data);
        this.data=subdata;
        return this;
    }
    setOriginData = function(){
        if(this.subdata)
            this.data=Object.assign({},this.subdata);
        this.subdata=null;
        return this;
    }
    setSmoothCurve = function(factor=0.5){
        this.setOriginData();
        //날짜 순서대로 정렬
        const entry = Object.entries(this.data).sort( (m, n) => m[0]  > n[0] ? 1 : -1);
        const res = {}
        entry.forEach(([date, value], idx)=>{
            if(idx>0){
                const previous = entry[idx-1][1];
                res[date]=previous*factor+value*(1-factor);
            }
            else
                res[date]=value;
        })
        this.setSubData(res);
        return this;
    }
}

export class ExchangeRateData extends Data{
    constructor({base, symbol, stroke, orientation}) {
        super({
            type:"line",
            yAxis:`${base}/${symbol}`,
            stroke,
            orientation
        });
        this.base=base;
        this.symbol=symbol;
    }
    setData = async function(start, end){
        const data = await exchangeRate(this.base, this.symbol, start, end);
        this.data = data;
    }
    putLabel = function(){
        return `${this.base} / ${this.symbol} 환율`;
    }
}

export class KrxFSData extends Data{
    constructor({corpName, item, stroke, orientation}) {
        super({
            type:"bar",
            yAxis:`${corpName} ${item}`,
            stroke,
            orientation
        });
        this.corpName=corpName;
        this.item=item;
    }
    setData = async function(cacheData){
        const entries = Object.entries(cacheData);
        let res ={}
        entries.forEach(([quarter, value]) => {
            quarter = quarter.replace('_1Q','-03-31')
                            .replace('_2Q','-06-30')
                            .replace('_3Q','-09-30')
                            .replace('_4Q','-12-31');
            res[quarter]=value;
        })
        this.data = res;
    }
    putLabel = function(){
        return `${this.corpName} ${this.item}`;
    }
}