import createApp, { createContainerModule, createPageModule } from '../src'

describe('container_module_test', () => {
  const pageOpt = {
    initialState: {}
  }
  const containerOpt = {
    effectLoading: true,
    initialState: {
      count: 1
    },
    selectors: {
      getCount: state => state.count
    },
    reducers: {
      initCount(state, { payload }) {
        return {
          ...state,
          count: payload
        }
      }
    },
    effects: ({
      actions,
      sagaEffects: { put, call },
      enhancer: { syncPut }
    }) => ({
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
      },
      *saveCount({
        payload
      }: {
        payload: { callback: Function; count: number }
      }) {
        const { callback, count } = payload
        yield syncPut(actions.sleep(200))
        // We can use `put` here, but use `syncPut` to unit test `syncPut` reducer actions.
        yield syncPut(actions.initCount(count))
        callback()
      }
    })
  }

  const pageModule = createPageModule('pageModule1', pageOpt)

  test('single module & syncPut', done => {
    const app = createApp()
    const containerModule = createContainerModule('container1', containerOpt)
    app.addPage(pageModule, {
      containers: [containerModule]
    })
    app.start()

    expect(app._modules.container1).toBe(containerModule)
    const savedCount = 2
    const callback = () => {
      try {
        expect(containerModule.selectors.getCount()).toBe(savedCount)
        done()
      } catch (e) {
        done(e)
      }
    }
    app._store.dispatch(
      containerModule.actions.saveCount({ count: savedCount, callback })
    )
  })

  test('multi modules', () => {
    const app = createApp()
    const containerModule1 = createContainerModule('container1', containerOpt)
    const containerModule2 = createContainerModule('container2', containerOpt)
    app.addPage(pageModule, {
      containers: [containerModule1, containerModule2]
    })
    app.start()

    expect(app._modules.container1).toBe(containerModule1)
    expect(app._modules.container2).toBe(containerModule2)
  })

  test('effect & reducer & selector', () => {
    const app = createApp()
    const containerModule = createContainerModule('container1', containerOpt)
    app.addPage(pageModule, {
      containers: [containerModule]
    })
    app.start()

    const initCount = 102
    app._store.dispatch(containerModule.actions.fetchCount(initCount))
    const data = containerModule.selectors.getCount(app._store.getState())
    expect(data).toBe(initCount)
  })

  test('__getLoadings', async () => {
    const app = createApp()
    const containerModule = createContainerModule('container1', containerOpt)
    app.addPage(pageModule, {
      containers: [containerModule]
    })
    app.start()

    const duration = 1000
    app._store.dispatch(containerModule.actions.sleep(duration))
    let loadings = containerModule.selectors.__getLoadings()
    expect(loadings.sleep).toBe(true)

    loadings = await new Promise(resolve => {
      setTimeout(() => {
        resolve(containerModule.selectors.__getLoadings())
      }, duration * 2)
    })

    expect(loadings.sleep).toBe(false)
  })

  test('auth check', () => {
    let error = null
    const app = createApp()
    const containerModule1 = createContainerModule('container1', {
      effects: () => ({
        *fetchCount() {
          // do nothing
        }
      })
    })
    const containerModule2 = createContainerModule('container2', {
      effects: ({ sagaEffects: { put } }) => ({
        *fetchCount() {
          try {
            // here call actions of another container module , so it should throw error
            // in development environment.
            yield put(containerModule1.actions.fetchCount())
          } catch (e) {
            error = e
          }
        }
      })
    })
    app.addPage(pageModule, {
      containers: [containerModule1, containerModule2]
    })
    app.start()

    app._store.dispatch(containerModule2.actions.fetchCount())
    expect(error).not.toBeNull()
  })
})
