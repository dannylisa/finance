import React, { useEffect, useState } from 'react';
import Router from './Router';
import {authService} from './fbase';

const App = () => {
  const [init, setInit] = useState(false);
  const [user, setUser] = useState(null);
  useEffect(()=>{
    authService.onAuthStateChanged( u => {
      if(u)
        setUser(u)
      setInit(true);
    })
  })
  return init ?
          <Router isLoggedIn={Boolean(user)}/>
          :
          <h4>로딩중입니다...</h4>
}

export default App;
