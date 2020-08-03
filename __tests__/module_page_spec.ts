import _ from 'lodash'
import createApp, { createPageModule, createContainerModule } from '../src'
import { GET_LOADING_SELECTOR } from '../src/const'

describe('page_module_test', () => {
  const pageOpt = {
    effectLoading: true,
    initialState: {
      count: 1
    },
    selectors: {
      getCount: state => state.count,
      getIncreasedCount: (state, { payload }) => state.count + payload
    },
    reducers: {
      initCount(state, { payload }) {
        return {
          ...state,
          count: payload
        }
      }
    },
    effects: ({ actions, sagaEffects: { put, call } }) => ({
      *fetchCount({ payload }) {
        yield put(actions.initCount(payload))
      },
      *sleep({ payload }) {
        const sleepFn = (duration: number) =>
          new Promise(resove => {
            setTimeout(() => {
              resove()
            }, duration)
          })
        yield call(sleepFn, payload)
      }
    })
  }

  test('single module & getStore', () => {
    const module1 = createPageModule('module1', pageOpt)

    const app = createApp()
    app.addPage(module1)
    app.start()

    expect(app._modules.module1).toBe(module1)
    expect(typeof app.getStore().dispatch).toBe('function')
  })

  test('multi modules', () => {
    const module1 = createPageModule('module1', pageOpt)
    const module2 = createPageModule('module2', pageOpt)

    const app = createApp()
    app.addPage([module1, module2])
    app.start()

    expect(app._modules.module1).toBe(module1)
    expect(app._modules.module2).toBe(module2)
  })

  test('selector', () => {
    const module1 = createPageModule('module1', pageOpt)
    const app = createApp()
    app.addPage(module1)
    app.start()

    const increateCount = 100
    // selector
    const data1 = module1.selectors.getCount()
    // selector with arg
    const data2 = module1.selectors.getIncreasedCount(increateCount)
    expect(data2 - data1).toBe(increateCount)
  })

  test('reducer & selector', () => {
    const module1 = createPageModule('module1', pageOpt)
    const app = createApp()
    app.addPage(module1)
    app.start()

    const initCount = 101
    app._store.dispatch(module1.actions.initCount(initCount))
    const data = module1.selectors.getCount()
    expect(data).toBe(initCount)
  })

  test('effect & reducer & selector', () => {
    const module1 = createPageModule('module1', pageOpt)
    const app = createApp()
    app.addPage(module1)
    app.start()

    const initCount = 102
    app._store.dispatch(module1.actions.fetchCount(initCount))
    const data = module1.selectors.getCount(app._store.getState())
    expect(data).toBe(initCount)
  })

  test('inject & getGlobalState & getModuleState & watchers & removeModule', () => {
    const initCount = 103
    const eventName = 'test_event'
    const containerModule = createContainerModule('container1', {
      selectors: {
        getCount: (state, { pageSelectors }) => pageSelectors.getCount()
      },
      effects: ({ enhancer: { emit } }) => ({
        *addCountEvent({ payload }) {
          yield emit({ name: eventName, payload })
        },
        *fetchCount() {
          // do nothing
        },
        *fetchCount2() {
          // do nothing
        }
      })
    })

    const pageNamespace = 'page1'
    const pageModule = createPageModule(pageNamespace, {
      initialState: {
        count: initCount
      },
      selectors: {
        getCount: state => state.count
      },
      reducers: {
        addCount: (state, { payload }) => ({
          ...state,
          count: state.count + payload
        }),
        setCount: (state, { payload }) => ({
          ...state,
          count: payload
        })
      },
      injectModules: [containerModule],

      effects: ({ actions, sagaEffects: { put } }) => ({
        *fetchCount({ payload }) {
          yield put(actions.setCount(payload))
        }
      }),
      watchers: ({ actions, sagaEffects: { put } }) => ({
        *[containerModule.event(eventName)]({ payload }) {
          yield put(actions.addCount(payload))
        },
        // watch both actions of container module
        [`${containerModule.actions.fetchCount},${containerModule.actions.fetchCount2}`]: [
          function*({ payload }) {
            yield put(actions.fetchCount(payload))
          },
          'takeLatest'
        ]
      })
    })
    const app = createApp()
    app.addPage(pageModule, {
      containers: [containerModule]
    })
    app.start()

    const data1 = containerModule.selectors.getCount(
      app._store.getState(),
      null
    )
    expect(data1).toBe(initCount)

    // Note: `getGlobalState` is a builtin selector in KOP which returns
    // global state instead of module(local) state.
    const globalState = pageModule.selectors.getGlobalState()
    expect(globalState[pageNamespace].count).toEqual(initCount)

    // Note: `getModuleState` is also a builtin selector in KOP which returns
    // module(local) state.
    const moduleState = pageModule.selectors.getModuleState()
    expect(moduleState.count).toEqual(initCount)

    app._store.dispatch(containerModule.actions.addCountEvent(1))
    const data2 = pageModule.selectors.getCount()
    expect(data2).toBe(initCount + 1)

    app._store.dispatch(containerModule.actions.fetchCount(initCount + 2))
    const data3 = pageModule.selectors.getCount()
    expect(data3).toBe(initCount + 2)

    app._store.dispatch(containerModule.actions.fetchCount2(initCount + 3))
    const data4 = pageModule.selectors.getCount()
    expect(data4).toBe(initCount + 3)

    expect(app._modules[pageModule.namespace]).toBe(pageModule)
    app.removeModule(pageModule)
    expect(app._modules[pageModule.namespace]).toBeUndefined()
  })

  test('createApp with onError', async () => {
    const initCount = 103
    const eventName = 'test_event'
    let caughtError: Error | null = null
    const watcherErrorMsg = 'watcher error'
    const containerModule = createContainerModule('container1', {
      selectors: {
        getCount: (state, { pageSelectors }) => pageSelectors.getCount()
      },
      effects: ({ enhancer: { emit } }) => ({
        *addCountEvent({ payload }) {
          yield emit({ name: eventName, payload })
        }
      })
    })
    const pageModule = createPageModule('page1', {
      initialState: {
        count: initCount
      },
      selectors: {
        getCount: state => state.count
      },
      reducers: {
        addCount: (state, { payload }) => ({
          ...state,
          count: state.count + payload
        })
      },
      injectModules: [containerModule],
      effects: () => ({}),
      watchers: () => ({
        // eslint-disable-next-line require-yield
        *[containerModule.event(eventName)]() {
          throw new Error(watcherErrorMsg)
        }
      })
    })

    const app = createApp({
      onError: (e: Error) => {
        caughtError = e
      }
    })
    app.addPage(pageModule, {
      containers: [containerModule]
    })
    app.start()

    expect(caughtError).toBeNull()
    app._store.dispatch(containerModule.actions.addCountEvent(1))
    expect(caughtError.message).toBe(watcherErrorMsg)
  })

  test('getLoading selector', async () => {
    const module1 = createPageModule('module1', pageOpt)
    const app = createApp()
    app.addPage(module1)
    app.start()

    const duration = 1000
    app._store.dispatch(module1.actions.sleep(duration))
    let loadings = module1.selectors[GET_LOADING_SELECTOR]()
    expect(loadings.sleep).toBe(true)

    loadings = await new Promise(resolve => {
      setTimeout(() => {
        resolve(module1.selectors[GET_LOADING_SELECTOR]())
      }, duration * 2)
    })

    expect(loadings.sleep).toBe(false)
  })

  test('auth check', () => {
    let error = null
    const module1 = createPageModule('module1', {
      effects: () => ({
        *fetchCount() {
          // do nothing
        }
      })
    })
    const module2 = createPageModule('module2', {
      effects: ({ sagaEffects: { put } }) => ({
        *fetchCount() {
          try {
            // here call actions of another page module, so it should throw error
            // in development environment.
            yield put(module1.actions.fetchCount())
          } catch (e) {
            error = e
          }
        }
      })
    })

    const app = createApp()
    app.addPage([module1, module2])
    app.start()

    app._store.dispatch(module2.actions.fetchCount(1))
    expect(error).not.toBeNull()
  })

  test('effect throw error', () => {
    const module1 = createPageModule('module1', {
      effectLoading: true,
      effects: () => ({
        // eslint-disable-next-line require-yield
        *fetchCount() {
          throw new Error('effect error')
        }
      })
    })
    const app = createApp()
    app.addPage(module1)
    app.start()

    const originConsoleError = console.error
    // Because fetchCount effect throw an error, the error is logged by
    // `console.error` and we do not want to see this error in the output,
    // so change `console.error` and restore it later.
    console.error = _.noop
    app._store.dispatch(module1.actions.fetchCount())
    console.error = originConsoleError
    const loadings = module1.selectors[GET_LOADING_SELECTOR]()
    expect(loadings.fetchCount).toBe(false)
  })
})
