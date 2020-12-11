import { exchangeRate } from 'getdata';
export class Data {
    constructor({type, yAxis, stroke, orientation}) {
        this.data = {};
        this.type = type || "line";
        this.yAxis = yAxis;
        this.stroke = stroke;
        this.orientation = orientation || "left";
        this.label = yAxis;
        this.isOrigin = true;
        this.needAxis = true;
    }
    setData = function(newData){
        this.data = newData;
        return this;
    }
    setStroke = function(stroke){
        this.stroke = stroke;
        return this;
    }
    toggleOrientation = function(){
        this.orientation = this.orientation === "left" ? "right" : "left";
        return this;
    }
    setLabel = function(label){
        this.label=label;
        return this;
    }
    setYaxis = function(yAxis){
        this.yAxis = yAxis;
        return this;
    }
    setIsOrigin = function(bool){
        this.isOrigin = bool;
        return this;
    }
    setNeedAxis = function(bool, dependAxis=''){
        this.needAxis = bool;
        if(!bool)
            this.dependAxis = dependAxis;
        return this;
    }
    setDepender = function(depender){
        this.depender = depender;
        return this;
    }
    getCopied = function(newYaxis, newLabel, needAxis){
        const res = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
        res.setIsOrigin(false).setLabel(newLabel).setYaxis(newYaxis).setDepender(null);
        //Axis의 Dependency를 설정해둠으로써 해당 데이터가 삭제되었을 시 depend하던 데이터가 Axis 이름을 물려받게 된다.
        if(!needAxis){ 
            res.setNeedAxis(false, this.yAxis);
            if(this.depender)
                this.depender = [...this.depender, res];
            else
                this.depender = [res];
        }
        return res;
    }
    // Should Call When Data dies
    giveDepender = function(){
        this.isRemoved = true;
        if(!this.depender)
            return;
        for(let i = 0; i<this.depender.length; i++){
            if(this.depender[i].isRemoved)
                continue;
            this.depender[i].setNeedAxis(true);
            this.depender[i].depender = this.depender.filter((d, idx)=>idx>i);
            this.depender[i].depender.forEach( data => {
                data.setNeedAxis(false, this.depender[i].yAxis);
            })
            return;
        }
    }
}
export class DailyData extends Data{
    getSmoothCurve = function(factor=0.5){
        const copied = this.getCopied(`${this.yAxis}(지수)`,`${this.label}(지수이동평균선)`, false)
        //날짜 순서대로 정렬
        const entry = Object.entries(copied.data).sort( (m, n) => m[0]  > n[0] ? 1 : -1);
        const res = {}
        entry.forEach(([date, value], idx)=>{
            if(idx>0){
                const previous = entry[idx-1][1];
                res[date]=previous*factor+value*(1-factor);
            }
            else
                res[date]=value;
        });
        return copied.setData(res);
    }
    getMovingAverage = function(days){
        const copied = this.getCopied(`${this.yAxis}(${days})`, `${this.label}(${days}일 이동평균선)`, false);
        const entry = Object.entries(copied.data).sort( (m, n) => m[0]  > n[0] ? 1 : -1);
        //days 보다 데이터 수가 작으면 return
        if(entry.length<days)
            return;
        let res = {};
        entry.reduce((sum, [date, value], idx)=>{
            if(idx<days)
                return sum+=value;
            else{
                sum+=(value-entry[idx-days][1]);
                res[date] = sum/days;
                return sum;
            }
        },0);
        (async () => {copied.setData(res)})();
        return copied;
    }
}

export class ExchangeRateData extends DailyData{
    constructor({base, symbol, stroke, orientation}) {
        super({
            type:"line",
            yAxis:`${base}/${symbol}`,
            stroke,
            orientation
        });
        this.base=base;
        this.symbol=symbol;
        this.setLabel(`${this.base} / ${this.symbol} 환율`);
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
        this.setLabel(`${this.corpName} ${this.item}`);
    }
    setCacheData = function(cacheData){
        const entries = Object.entries(cacheData);
        let res ={}
        entries.forEach(([quarter, value]) => {
            quarter = quarter.replace('_1Q','-03-31')
                            .replace('_2Q','-06-30')
                            .replace('_3Q','-09-30')
                            .replace('_4Q','-12-31');
            res[quarter]=value;
        })
        return this.setData(res);
    }
}