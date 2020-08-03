import createApp from '../src'
import createModule from '../src/module/module'
import { DEFAULT_MODULE } from '../src/const'

// unit test internal `createModule` API
describe('createModule', () => {
  test('selectors & reducers & effects', () => {
    const app = createApp()
    const initCount = 1
    const moduleOption = {
      initialState: {
        count: initCount
      },
      selectors: {
        getCount: state => state.count
      },
      reducers: {
        setCount: (state, { payload: count }) => ({
          ...state,
          count
        })
      },
      // Note: here `effects` function parameters are different from those of container or page module.
      effects: (actions, selectors, { put }) => ({
        fetchCount: [
          function*({ payload }) {
            yield put(actions.setCount(payload))
          },
          'takeLatest'
        ],
        *fetchCount2({ payload }) {
          yield put(actions.setCount(payload))
        }
      })
    }

    const module1 = createModule('module1', moduleOption, DEFAULT_MODULE)
    app.addModule(module1)
    app.start()

    expect(module1.selectors.getCount()).toBe(initCount)

    let newCount = 2
    app._store.dispatch(module1.actions.fetchCount(newCount))
    expect(module1.selectors.getCount()).toBe(newCount)

    newCount = 3
    app._store.dispatch(module1.actions.fetchCount2(newCount))
    expect(module1.selectors.getCount()).toBe(newCount)
  })
})
