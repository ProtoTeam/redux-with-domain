import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import createApp, { createContainerModule } from '@alipay/kop';

import Router from './Router';
import moduleCalculator from './modules/calculator/';

const app = createApp();

app.addRouter(<Router />);
app.addModule(moduleCalculator);

const moduleOpt = {
  initialState: {
    count: 1,
  },
  selectors: {
    getCount: state => state.count + 2,
  },
  reducers: {
    add(state, { payload }) {
      return Object.assign({}, state, {
        count: state.count + payload,
      });
    },
  },
};

const module4 = createContainerModule('module3/a', moduleOpt);
const module5 = createContainerModule('module3/b', moduleOpt);

app.addModule([module4, module5]);

const node = app.start();

ReactDOM.render(node, document.getElementById('root'));
