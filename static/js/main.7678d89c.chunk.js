(this.webpackJsonpfinance=this.webpackJsonpfinance||[]).push([[0],{239:function(n,e,t){},245:function(n,e){},247:function(n,e){},282:function(n,e){},284:function(n,e){},312:function(n,e){},314:function(n,e){},315:function(n,e){},320:function(n,e){},322:function(n,e){},341:function(n,e){},353:function(n,e){},356:function(n,e){},361:function(n,e){},363:function(n,e){},386:function(n,e){},495:function(n,e,t){"use strict";t.r(e);var c=t(15),a=t(1),o=t.n(a),i=t(59),r=t.n(i),u=(t(239),t(132)),s=t(231),f=t(13),j=t(47),l=t.n(j),p=t(88),d=t(227),b=t.n(d),h=function(){return Object(a.useEffect)(Object(p.a)(l.a.mark((function n(){var e;return l.a.wrap((function(n){for(;;)switch(n.prev=n.next){case 0:return n.prev=0,n.next=3,b.a.getStock("005930");case 3:e=n.sent,console.log(e),console.log("Success"),n.next=12;break;case 8:n.prev=8,n.t0=n.catch(0),console.log("Failed"),console.log(n.t0);case 12:case"end":return n.stop()}}),n,null,[[0,8]])}))),[]),Object(c.jsx)("div",{children:"Home"})},x=t(60);t(487),t(489),t(496);x.a.initializeApp({apiKey:"AIzaSyDVimEnl5_xYZdIEmp3nABS4UfP-Zz3vr0",authDomain:"finance-9a8e5.firebaseapp.com",projectId:"finance-9a8e5",storageBucket:"finance-9a8e5.appspot.com",messagingSenderId:"1015332684575",appId:"1:1015332684575:web:12d8686e41f00422c0a62a",measurementId:"G-J33EZKTRSW"});var O=x.a,g=x.a.auth(),v=(x.a.firestore(),x.a.storage(),t(510)),m=t(232),I=function(){var n=function(){var n=Object(p.a)(l.a.mark((function n(){var e;return l.a.wrap((function(n){for(;;)switch(n.prev=n.next){case 0:return e=new O.auth.GoogleAuthProvider,n.next=3,g.signInWithPopup(e);case 3:case"end":return n.stop()}}),n)})));return function(){return n.apply(this,arguments)}}();return Object(c.jsxs)(v.a,{variant:"outlined",onClick:n,fullWidth:!0,children:[Object(c.jsx)(m.a,{})," \xa0 \uad6c\uae00\uc544\uc774\ub514\ub85c \ub85c\uadf8\uc778"]})},S=function(n){var e=n.isLoggedIn;return Object(c.jsx)(s.a,{children:Object(c.jsx)(f.c,{children:e?Object(c.jsx)(f.a,{exact:!0,path:"/",children:Object(c.jsx)(h,{})}):Object(c.jsx)(f.a,{exact:!0,path:"/",children:Object(c.jsx)(I,{})})})})},k=function(){var n=Object(a.useState)(!1),e=Object(u.a)(n,2),t=e[0],o=e[1],i=Object(a.useState)(null),r=Object(u.a)(i,2),s=r[0],f=r[1];return Object(a.useEffect)((function(){g.onAuthStateChanged((function(n){n&&f(n),o(!0)}))})),t?Object(c.jsx)(S,{isLoggedIn:Boolean(s)}):Object(c.jsx)("h4",{children:"\ub85c\ub529\uc911\uc785\ub2c8\ub2e4..."})};r.a.render(Object(c.jsx)(o.a.StrictMode,{children:Object(c.jsx)(k,{})}),document.getElementById("root"))}},[[495,1,2]]]);
//# sourceMappingURL=main.7678d89c.chunk.js.map