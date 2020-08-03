import createApp, {
  createContainerModule,
  createPageModule,
  createGlobalModule
} from '../src'

describe('global_module_test', () => {
  test('selectors & reducers & effects & actionCreators', () => {
    let authError = null

    const containerOpt = {
      initialState: {},
      effects: () => ({
        *query() {
          // nothing to do
        }
      })
    }
    const containerModule = createContainerModule('container1', containerOpt)

    const globalNamespace = 'global1'
    const globalOpt = {
      effectLoading: true,
      initialState: {
        count: 0
      },
      selectors: {
        getCount: state => state.count
      },
      reducers: {
        setCount: (state, { payload }: { payload: number }) => ({
          ...state,
          count: payload
        }),
        add: (state, { payload }: { payload: number }) => ({
          ...state,
          count: state.count + payload
        })
      },
      effects: ({ actions, sagaEffects: { put } }) => ({
        *fetchCount({ payload }: { payload: number }) {
          yield put(actions.setCount(payload))
        },
        *query() {
          try {
            // global module can only dispatch its own actions, so it should throw error
            yield put(containerModule.actions.query())
          } catch (e) {
            authError = e
          }
        }
      }),
      actionCreators: ({ createAction }) => ({
        incrementCount: createAction('increment'),
        decrementCount: (payload: number) => ({
          type: `${globalNamespace}/decrement`,
          payload
        })
      })
    }
    const globalModule = createGlobalModule(globalNamespace, globalOpt)

    const pageOpt = {
      initialState: {
        name: ''
      },
      selectors: {
        getName: state => state.name
      },
      reducers: {
        setName: (state, { payload }: { payload: string }) => ({
          ...state,
          name: payload
        })
      },
      effects: ({ sagaEffects: { put } }) => ({
        *fetchCount({ payload }) {
          yield put(globalModule.actions.fetchCount(payload))
        }
      }),
      watchers: ({ sagaEffects: { put } }) => ({
        // watch `incrementCount` action creator
        *[`${globalNamespace}/increment`]({ payload }: { payload: number }) {
          yield put(globalModule.actions.add(payload))
        },
        // watch `decrementCount` action creator
        *[`${globalNamespace}/decrement`]({ payload }: { payload: number }) {
          yield put(globalModule.actions.add(-payload))
        }
      })
    }
    const pageModule = createPageModule('page1', pageOpt)

    const app = createApp()
    app.addPage(pageModule)
    app.addModule(containerModule)
    app.addGlobal(globalModule)
    app.start()
    expect(globalModule.selectors.getCount()).toBe(0)
    app._store.dispatch(pageModule.actions.fetchCount(1))
    expect(globalModule.selectors.getCount()).toBe(1)

    expect(authError).toBeNull()
    app._store.dispatch(globalModule.actions.query())
    expect(authError).not.toBeNull()

    // plus one
    app._store.dispatch(globalModule.actions.incrementCount(1))
    expect(globalModule.selectors.getCount()).toBe(2)

    // minus one
    app._store.dispatch(globalModule.actions.decrementCount(1))
    expect(globalModule.selectors.getCount()).toBe(1)
  })
})
