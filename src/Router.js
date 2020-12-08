import React from 'react';
import {HashRouter, Route, Switch} from 'react-router-dom';
import Home from './routes/Home';
import Auth from './routes/Auth';

const Router = ({isLoggedIn}) => {
    return (
        <HashRouter>
            <Switch>
                {
                    isLoggedIn ?
                        <Route exact path="/">
                            <Home />
                        </Route>
                    :
                        <Route exact path="/">
                            <Auth />
                        </Route>
                }
            </Switch>
        </HashRouter>
    )
}

export default Router;