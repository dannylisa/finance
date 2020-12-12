export class Data {
    constructor({yAxis, stroke, orientation}) {
        this.data = {};
        this.yAxis = yAxis;
        this.stroke = stroke;
        this.orientation = orientation || "left";
        this.label = yAxis;
        this.isOriginData = true;
        this.needAxis = true;
        this.isOriginData = true;
    }
    setData = function(newData){
        this.data = newData;
        return this;
    }
    setType = function(type){
        this.type = type;
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
    setOriginData = function(data){
        this.originData = data;
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
    setIsOriginData = function(bool){
        this.isOriginData = bool;
        return this;
    }
    getCopied = function(newYaxis, newLabel){
        const res = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
        res.setIsOriginData(false).setLabel(newLabel).setYaxis(newYaxis).setOriginData(this);
        return res;
    }
    getOriginData = function(){
        if(this.isOriginData)
            return this;
        return this.originData;
    }
    //Axis의 Dependency를 설정해둠으로써 해당 데이터가 삭제되었을 시 depend하던 데이터가 Axis 이름을 물려받게 된다.
    // addDepender = function(depender){
    //     depender.setDepender(null);
    //     depender.setNeedAxis(false, this.yAxis);
    //     if(this.depender)
    //         this.depender = [...this.depender, depender];
    //     else
    //         this.depender = [depender];
    // }
    // // Should Call When Data dies
    // giveDepender = function(){
    //     this.isRemoved = true;
    //     if(!this.depender)
    //         return;
    //     for(let i = 0; i<this.depender.length; i++){
    //         if(this.depender[i].isRemoved)
    //             continue;
    //         this.depender[i].setNeedAxis(true);
    //         this.depender[i].depender = this.depender.filter((d, idx)=>idx>i);
    //         this.depender[i].depender.forEach( data => {
    //             data.setNeedAxis(false, this.depender[i].yAxis);
    //         })
    //         return;
    //     }
    // }
    //sorted by date, or xAxis
    getSortedData = function(){
        return Object.entries(this.data).sort( (m, n) => m[0]  > n[0] ? 1 : -1);
    }
}
export class LineData extends Data{
    constructor(props){
        super(props);
        this.type = "line";
    }

    //Line데이터를 각 월의 월말 데이터로 변환한다.
    toMonthlyData = function(){
        if(this.originData instanceof BarData)
            return this.originData;
        const copied = this.getCopied(this.yAxis, this.label);
        const entry = copied.getSortedData();

        const res = {};
        entry.reduce((sofarDataArr, [date, value], index) =>{
            sofarDataArr = [...sofarDataArr, value];
            if( index===entry.length-1 || (new Date(date).getMonth() !== new Date(entry[index+1][0]).getMonth())){
                const average = sofarDataArr.reduce((sum, d) => sum+d, 0) / sofarDataArr.length;
                let lastDayOfMonth;
                if(index === entry.length-1)
                    lastDayOfMonth = date;
                else{
                    const dd = new Date(date);
                    lastDayOfMonth = new Date(dd.getFullYear(), dd.getMonth()+1, 0).format('yyyy-mm-dd');
                }
                res[lastDayOfMonth]=average;
                return [];
            }
            else{
                return sofarDataArr
            }
        }, [])
        return copied.setData(res);
    }
    getSmoothCurve = function(factor=0.5){
        const copied = this.getCopied(`${this.yAxis}(지수)`,`${this.label}(지수이동평균선)`)
        //날짜 순서대로 정렬
        const entry = copied.getSortedData();
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
        const entry = copied.getSortedData();
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
        return copied.setData(res);
    }
}

export class BarData extends Data{
    constructor(props){
        super(props);
        this.type = "bar";
    }
    toBarData = function(){
        this.type = "bar";
        return this;
    }
    toLineData = function(){
        this.type = "line";
        return this;
    }
    // 연속적인 데이터를 계단식으로 생성
    // frontOffset만큼 앞에 데이터를 추가한다.
    toStairData = function(frontOffset, onlyWeekDays){
        frontOffset = frontOffset || 90;
        onlyWeekDays = onlyWeekDays || true;
        if(this.originData)
            return this;
        const copied = this.getCopied(this.yAxis, this.label);
        const entry = copied.getSortedData();

        const res = {};
        let curr = new Date(entry[0][0]);
        curr.setDate(curr.getDate()-frontOffset);
        entry.forEach(([date, value])=>{
            while(curr<=new Date(date)){
                if(onlyWeekDays && (curr.getDay() === 0 || curr.getDay() === 6)){
                    curr.setDate(curr.getDate()+1);
                    continue;
                }
                res[curr.format('yyyy-mm-dd')]=value;
                curr.setDate(curr.getDate()+1)
            }
        })
        return copied.setType('line').setData(res);
    }
}

export class ExchangeRateData extends LineData{
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

export class KrxFSData extends BarData{
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
            const yearReg = /^(19|20)\d{2}$/;
            if(yearReg.test(quarter))
                quarter += '-12-31';
            res[quarter]=value;
        })
        return this.setData(res);
    }
}

