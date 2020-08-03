import React from "react";
import { Router } from "react-router";
import { Route, Switch } from "react-router-dom";
import { createHashHistory } from "history";
import Demo from "./Demo";

const history = createHashHistory();
const AppRouter = () => (
  <Router history={history}>
    <Switch>
      <Route exact path="/" component={Demo} />
      <Route path="/test" component={() => "test"} />
    </Switch>
  </Router>
);

export default AppRouter;
