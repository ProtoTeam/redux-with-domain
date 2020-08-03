import React from "react";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";

import Workbook from "./page/workbook/ui";
import Report from "./page/reportView/ui";

const AppRouter = () => {
  return (
    <Router>
      <div className="main">
        <Switch>
          <Route path="/workbook/:id" component={Workbook} />
          <Route path="/report/:id" component={Report} />
          <Redirect from="/" to="/workbook/1" />
        </Switch>
      </div>
    </Router>
  );
};

export default <AppRouter />;
