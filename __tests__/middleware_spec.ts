import createApp, { createPageModule } from '../src'

describe('add_middleware', () => {
  test('multi modules', () => {
    const app = createApp()

    const module = createPageModule('page', {
      initialState: {
        count: 0
      },
      selectors: {
        getCount: state => state.count
      },
      reducers: {
        addCount: (state, { payload }) => ({
          ...state,
          count: state.count + payload
        })
      }
    })

    const resetPayloadMiddleware = () => next => action => {
      const result = next({
        ...action,
        payload: 0
      })
      return {
        ...result,
        count: 0
      }
    }
    app.addMiddleWare(resetPayloadMiddleware)
    app.addPage(module)
    app.start()

    app._store.dispatch(module.actions.addCount(100))
    const data2 = module.selectors.getCount(app._store.getState())
    expect(data2).toBe(0)
  })
})
