import React, { useEffect } from 'react';
import { latestStockInfo } from 'getdata';

const Recommend = () => {
    useEffect(()=>{
        const data = latestStockInfo('005930');
    }, [])
    return (<div>

    </div>)
}

export default Recommend