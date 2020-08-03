import React, { PureComponent } from 'react';
import Calculator from './modules/calculator/ui';

import './Demo.css';

export default class Component extends PureComponent {
  render() {
    return (
      <div className="page-demo">
        <h2>hello kop</h2>
        <Calculator />
      </div>
    );
  }
}
