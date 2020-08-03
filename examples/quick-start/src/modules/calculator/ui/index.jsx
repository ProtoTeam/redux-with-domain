import React, { PureComponent } from 'react';
import { connect } from '@alipay/kop';
import { Transition } from 'react-transition-group';
import moduleCalculator from '../';

import './index.css';

const defaultStyle = {
  transition: 'background-color 1s',
  display: 'inline-block',
  backgroundColor: '#ffffff',
};

const Calculator = class Component extends PureComponent {
  add = () => {
    this.props.addCount();
  };

  reset = () => {
    this.props.reset();
  };

  queryData = () => {
    this.props.queryData();
  };

  testEffect = () => {
    this.props.testEffect();
  };

  render() {
    const { count, loadings } = this.props;

    return (
      <div
        style={{
          ...defaultStyle,
        }}
      >
        <div className="component-calculator">
          <div className="count">count:{count}</div>
          <button onClick={this.add}>+1</button>
          <button onClick={this.reset}>reset</button>
          <button onClick={this.queryData}>query data</button>
          {loadings['queryData'] ? <span>queryData-loading...</span> : null}
          <button onClick={this.testEffect}>test effect</button>
          {loadings['testEffect'] ? <span>testEffect-loading...</span> : null}
          <button onClick={this.props.pageNav}>test router</button>
        </div>
      </div>
    );
  }
};

const { selectors, actions } = moduleCalculator;

export default connect(
  state => ({
    count: selectors.getCount(state),
    loadings: selectors.__getLoadings(state),
  }),
  {
    addCount: actions.addCount,
    reset: actions.__reset,
    queryData: actions.queryData,
    testEffect: actions.testEffect,
    pageNav: actions.pageNav,
  }
)(Calculator);
