import React, { useEffect, useState } from 'react';
import Router from 'Router';
import {authService} from 'fbase';

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
Date.prototype.format= function (f){
  // yyyy : Full Year 
  f=f.replace('yyyy', this.getFullYear());
  // yy : year in length 2
  f=f.replace('yy', this.getFullYear()%100);
  // mm : Month
  f=f.replace('mm', this.getMonth() > 8 ? this.getMonth() + 1 : '0' + (this.getMonth() + 1));
  // dd : date
  f=f.replace('dd', this.getDate() > 9 ? this.getDate() : '0' + (this.getDate()));
  return f;
}
Date.prototype.addDate = function(dates){
  this.setDate(this.getDate()+dates);
  return this;
}
export default App;
