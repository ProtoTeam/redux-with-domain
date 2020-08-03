import update from 'immutability-helper';
import { createContainerModule, autoGetSet, saga } from '@alipay/kop';
import { createHashHistory } from 'history';

const history = createHashHistory();

export default createContainerModule(
  'demo/calculator',
  autoGetSet({
    initialState: {
      count: 0,
      animation: false,
    },
    reducers: {
      add: (state, { payload }) => {
        console.log('state', state);
        return update(state, {
          count: {
            $set: state.count + 1,
          },
        });
      },
      updateCount: (state, { payload }) => {
        return update(state, {
          count: {
            $set: payload,
          },
        });
      },
    },
    effects({ actions, selector, sagaEffects: { put, call } }) {
      return {
        *addCount() {
          yield put(actions.add());
        },
        *queryData() {
          const result = yield query();
          yield put(actions.updateCount(result));
        },
        *testEffect() {
          // 测试effect失败的loading恢复
          console.log('test error effect');
          yield saga.delay(1000);
          throw new Error('Whoops!');
          yield console.log('testEffect');
        },
        *pageNav() {
          yield call(history.push, '/test');
        },
      };
    },
  })
);

/**
 * 模拟fetch
 */
const mockFetch = () =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ value: 99999 });
    }, 1000);
  });

/**
 * 远程请求数据
 */
const query = async () => await mockFetch().then(response => response.value);
