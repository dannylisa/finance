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