import React, { useEffect, useState } from 'react';
import krx from 'krx-stock-api';
 
const Home = () => {
    useEffect(() => {
        (async () => console.log(await krx.getStock('005930')))();
    })

    return(
        <div>Home</div>
    )
}

export default Home;