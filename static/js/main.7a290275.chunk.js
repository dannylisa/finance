(this.webpackJsonpfinance=this.webpackJsonpfinance||[]).push([[0],{239:function(n,e,t){},245:function(n,e){},247:function(n,e){},282:function(n,e){},284:function(n,e){},312:function(n,e){},314:function(n,e){},315:function(n,e){},320:function(n,e){},322:function(n,e){},341:function(n,e){},353:function(n,e){},356:function(n,e){},361:function(n,e){},363:function(n,e){},386:function(n,e){},495:function(n,e,t){"use strict";t.r(e);var c=t(15),a=t(1),o=t.n(a),i=t(59),r=t.n(i),u=(t(239),t(132)),s=t(231),f=t(13),j=t(47),p=t.n(j),l=t(88),d=t(227),b=t.n(d),h=function(){return Object(a.useEffect)(Object(l.a)(p.a.mark((function n(){var e;return p.a.wrap((function(n){for(;;)switch(n.prev=n.next){case 0:return n.prev=0,n.next=3,b.a.getStock("005930");case 3:e=n.sent,console.log(e),n.next=10;break;case 7:n.prev=7,n.t0=n.catch(0),console.log(n.t0);case 10:case"end":return n.stop()}}),n,null,[[0,7]])}))),[]),Object(c.jsx)("div",{children:"Home"})},x=t(60),O=(t(487),t(489),t(496),{apiKey:"AIzaSyDVimEnl5_xYZdIEmp3nABS4UfP-Zz3vr0",authDomain:"finance-9a8e5.firebaseapp.com",projectId:"finance-9a8e5",storageBucket:"finance-9a8e5.appspot.com",messagingSenderId:"1015332684575",appId:"1:1015332684575:web:12d8686e41f00422c0a62a",measurementId:"G-J33EZKTRSW"});console.log(O),console.log(x.a.initializeApp(O));var g=x.a,v=x.a.auth(),m=(x.a.firestore(),x.a.storage(),t(510)),I=t(232),S=function(){var n=function(){var n=Object(l.a)(p.a.mark((function n(){var e;return p.a.wrap((function(n){for(;;)switch(n.prev=n.next){case 0:return e=new g.auth.GoogleAuthProvider,n.next=3,v.signInWithPopup(e);case 3:case"end":return n.stop()}}),n)})));return function(){return n.apply(this,arguments)}}();return Object(c.jsxs)(m.a,{variant:"outlined",onClick:n,fullWidth:!0,children:[Object(c.jsx)(I.a,{})," \xa0 \uad6c\uae00\uc544\uc774\ub514\ub85c \ub85c\uadf8\uc778"]})},k=function(n){var e=n.isLoggedIn;return Object(c.jsx)(s.a,{children:Object(c.jsx)(f.c,{children:e?Object(c.jsx)(f.a,{exact:!0,path:"/",children:Object(c.jsx)(h,{})}):Object(c.jsx)(f.a,{exact:!0,path:"/",children:Object(c.jsx)(S,{})})})})},w=function(){var n=Object(a.useState)(!1),e=Object(u.a)(n,2),t=e[0],o=e[1],i=Object(a.useState)(null),r=Object(u.a)(i,2),s=r[0],f=r[1];return Object(a.useEffect)((function(){v.onAuthStateChanged((function(n){n&&f(n),o(!0)}))})),t?Object(c.jsx)(k,{isLoggedIn:Boolean(s)}):Object(c.jsx)("h4",{children:"\ub85c\ub529\uc911\uc785\ub2c8\ub2e4..."})};r.a.render(Object(c.jsx)(o.a.StrictMode,{children:Object(c.jsx)(w,{})}),document.getElementById("root"))}},[[495,1,2]]]);
//# sourceMappingURL=main.7a290275.chunk.js.map