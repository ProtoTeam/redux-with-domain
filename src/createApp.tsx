import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'

import createSagaMiddleware, { SagaMiddleware, effects } from 'redux-saga'

import {
  applyMiddleware,
  createStore,
  compose,
  combineReducers,
  Middleware,
  Action,
  Reducer,
  Store,
  AnyAction
} from 'redux'
import {
  isString,
  isFunction,
  isPlainObject,
  isArray,
  isElement,
  reduce,
  set,
  mapValues,
  noop,
  forEach,
  pickBy,
  isEmpty,
  extend,
  get,
  cloneDeepWith
} from 'lodash'
import invariant from 'invariant'
import { DOMAIN_MODULE, ENTITY_MODULE, KOP_GLOBAL_STORE_REF } from './const'
import defaultMiddleWares from './middlewares'
import {
  isModule,
  isPresenter,
  toStorePath,
  hasDuplicatedKeys,
  config
} from './utils'
import initSelectorHelper from './module/options/selector'
import {
  Presenter,
  Module,
  Modules,
  App,
  ReducerHandler,
  CreateOpt,
  PageOption,
  ParentNode
} from './types/createApp'
import { DefaultReducer } from './types/common'

// global store ref
let _store: Store

export default function createApp(createOpt: CreateOpt = {}) {
  let app: App
  const { initialReducer, onError, multiInstance } = createOpt

  // internal map for modules
  const _modules: Modules = {}

  let _router = <div />

  const _middleWares: Middleware<{}>[] = [...defaultMiddleWares]
  const sagaMiddleware: SagaMiddleware<{}> = createSagaMiddleware()

  _middleWares.push(sagaMiddleware)

  function hasSubModule(module: Module) {
    let flag = false
    forEach(module, value => {
      if (isModule(value)) {
        flag = true
      }
    })
    return flag
  }

  function _addModule(m: Module) {
    invariant(!_modules[m.namespace], `kop nodule ${m.namespace} exists`)

    if (!isEmpty(m.entities)) {
      forEach(m.entities, e => {
        _addModule(e)
      })
    }
    _modules[m.namespace] = m
  }

  // create reducer
  // http://redux.js.org/docs/recipes/reducers/RefactoringReducersExample.html
  function createReducer(
    initialState = {},
    handlers: ReducerHandler,
    defaultReducer?: DefaultReducer<any>
  ) {
    return (state = initialState, action: Action) => {
      if (
        Object.prototype.hasOwnProperty.call(handlers, action.type) &&
        isFunction(handlers[action.type])
      ) {
        const handler = handlers[action.type]
        return handler(state, action)
      }
      if (defaultReducer && isFunction(defaultReducer)) {
        return defaultReducer(state, action)
      }
      return state
    }
  }

  function loopCombineReducer(
    tree: any,
    combineRootreducer = true,
    parentNode?: string | ParentNode
  ) {
    const childReducer: any = mapValues(tree, node => {
      if (!isModule(node)) {
        return loopCombineReducer(node)
      }

      if (hasSubModule(node)) {
        const subModuleMap = pickBy(node, value => isModule(value))
        return loopCombineReducer(subModuleMap, true, node)
      }

      return createReducer(
        node._initialState,
        node._reducers,
        node._defaultReducer
      )
    })

    let result

    if (isEmpty(parentNode)) {
      result = {
        ...childReducer
      }
    } else if (parentNode === 'root') {
      invariant(
        !initialReducer || isPlainObject(initialReducer),
        'initialReducer should be object'
      )
      const noDuplicatedKeys = !hasDuplicatedKeys(
        initialReducer,
        childReducer,
        'router'
      )
      invariant(
        noDuplicatedKeys,
        'initialReducer has reduplicate keys with other reducers'
      )

      result = {
        ...initialReducer,
        ...childReducer
      }
    } else {
      result = {
        base: createReducer(
          (parentNode as ParentNode)._initialState,
          (parentNode as ParentNode)._reducers,
          (parentNode as ParentNode)._defaultReducer
        ),
        ...childReducer
      }
    }

    if (parentNode === 'root' && !combineRootreducer) return result

    return combineReducers(result)
  }

  function addModule(module: Module | Module[]) {
    if (isArray(module)) {
      module.forEach(m => {
        _addModule(m)
      })
    } else {
      _addModule(module)
    }
  }

  function initInjectModules(presenter: Presenter) {
    forEach(presenter.injectModules, (name: string) => {
      invariant(_modules[name], `please check the kop-module ${name} is added`)
      extend(_modules[name].presenter, {
        loaded: true, // 标记已被装载，在module中会注入 presentor 的 seletor
        selectors: presenter.selectors,
        actions: presenter.actions
      })
    })
  }

  function createRootReducer(combineRootreducer = true) {
    const moduleData = cloneDeepWith(_modules)
    const moduleTree = reduce(
      moduleData,
      (result, value, key) => {
        const module = get(result, toStorePath(key))

        if (isModule(value)) {
          if (module) {
            return set(result, `${toStorePath(key)}.base`, value)
          }
          return set(result, toStorePath(key), value)
        }

        return result
      },
      {}
    )

    return loopCombineReducer(moduleTree, combineRootreducer, 'root')
  }

  function addPage(pageModule: Module, opt: PageOption = {}) {
    const { containers } = opt

    if (containers && containers.length > 0) {
      addModule(containers)
    }

    if (pageModule.injectModules && pageModule.injectModules.length > 0) {
      initInjectModules(pageModule)
    }

    addModule(pageModule)
  }

  function addDomain(module: Module) {
    addModule(module)
  }

  const addGlobal = _addModule

  function removeModule(module: Module | Module[]) {
    const _remove = (m: Module) => {
      invariant(
        _modules[m.namespace],
        `error: the kop-module - ${m.namespace} is not existed`
      )

      // hack redux-devtools's bug
      if (
        m &&
        m.actions &&
        !isPresenter(m) &&
        m.type !== DOMAIN_MODULE &&
        (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ) {
        _store.dispatch(m.actions.__reset())
      }

      delete _modules[m.namespace]
      _store.dispatch({ type: `${m.namespace}/@@KOP_CANCEL_EFFECTS` })
    }

    if (isArray(module)) {
      module.forEach(m => {
        _remove(m)
      })
      _store.replaceReducer(createRootReducer() as Reducer)
    } else if (module) {
      _remove(module)
      _store.replaceReducer(createRootReducer() as Reducer)
    }
  }

  function addRouter(r: JSX.Element) {
    _router = r
  }

  function addMiddleWare(middleWare: Middleware) {
    const add = (m: Middleware) => {
      _middleWares.push(m)
    }

    add(middleWare)
  }

  function getStore() {
    return _store
  }

  function createAppStore() {
    // inject chrome redux devtools
    let composeEnhancers

    if (
      process.env.NODE_ENV !== 'production' &&
      (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ) {
      composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    } else {
      composeEnhancers = compose
    }

    const enhancer = composeEnhancers(applyMiddleware(..._middleWares))
    const rootReducer = createRootReducer()
    return createStore(rootReducer as Reducer, enhancer)
  }

  function getArguments(...args: any[]) {
    let domSelector: string | null = null
    let callback = noop

    if (args.length === 1) {
      // app.start(false) means jump render phase and return early
      if (args[0] === false) {
        return {
          domSelector: '',
          callback: noop,
          shouldRender: false
        }
      }
      if (isString(args[0])) {
        domSelector = args[0]
      }
      if (isFunction(args[0])) {
        callback = args[0]
      }
    }

    if (args.length === 2) {
      domSelector = args[0]
      callback = args[1]
    }

    return {
      domSelector,
      callback,
      shouldRender: true
    }
  }

  function renderAppElement(
    domSelector: string | null,
    callback: Function,
    shouldRender: boolean
  ) {
    const $elem = <Provider store={_store}>{_router}</Provider>

    // skip render when shouldRender is false
    if (shouldRender) {
      if (isString(domSelector)) {
        render($elem, document.querySelector(domSelector), () => {
          callback()
        })
      } else if (isElement(domSelector)) {
        render($elem, domSelector, () => {
          callback()
        })
      } else {
        callback()
      }
    }

    return $elem
  }

  function _onError(e: Error) {
    if (!onError) {
      console.error(e)
    } else {
      onError(e)
    }
  }

  // create root saga
  function createSaga(module: Module) {
    return function*() {
      if (isArray(module.effects)) {
        for (let i = 0, k = module.effects.length; i < k; i++) {
          const task = yield effects.fork(function*(): any {
            try {
              if (module.effects) {
                yield module.effects[i]()
              }
            } catch (e) {
              _onError(e)
            }
          })

          yield effects.fork(function*() {
            yield effects.take(`${module.namespace}/@@KOP_CANCEL_EFFECTS`)
            yield effects.cancel(task)
          })
        }
      }

      if (isArray(module.watchers)) {
        for (let i = 0, k = module.watchers.length; i < k; i++) {
          const task = yield effects.fork(function*(): any {
            try {
              if (module.watchers) {
                yield module.watchers[i]()
              }
            } catch (e) {
              _onError(e)
            }
          })
          yield effects.fork(function*() {
            yield effects.take(`${module.namespace}/@@KOP_CANCEL_EFFECTS`)
            yield effects.cancel(task)
          })
        }
      }
    }
  }

  function start(...args: any[]) {
    const { domSelector, callback, shouldRender } = getArguments(...args)

    _store = createAppStore()

    initSelectorHelper(_store)

    app._store = _store

    window[KOP_GLOBAL_STORE_REF] = _store

    app._modules = _modules

    forEach(app._modules, (m: Module) => {
      if (m.type === ENTITY_MODULE) {
        m._store = _store // 提供domainModel的遍历action
      }
    })

    app._middleWares = _middleWares

    app._router = _router

    forEach(_modules, module => {
      sagaMiddleware.run(createSaga(module))
    })

    if (multiInstance) {
      config.multiInstance = multiInstance
    }

    return renderAppElement(domSelector, callback, shouldRender)
  }

  // 集成模式初始化，返回 saga，reducer 等等
  function _init() {
    const rootReducer = createRootReducer(false)
    return {
      rootReducer,
      sagaMiddleware
    }
  }

  // 集成模式启动，由外部 Redux 控制 App 渲染流程
  function _run(store: Store<any, AnyAction>) {
    initSelectorHelper(store)
    app._store = store
    window[KOP_GLOBAL_STORE_REF] = store
    app._modules = _modules
    forEach(app._modules, (m: Module) => {
      if (m.type === ENTITY_MODULE) {
        m._store = store
      }
    })
    app._router = _router
    forEach(_modules, module => {
      sagaMiddleware.run(createSaga(module))
    })
    if (multiInstance) {
      config.multiInstance = multiInstance
    }
  }

  app = {
    addModule, // register container module
    addPage, // register page module
    addDomain, // register domain module
    addGlobal, // register global module
    addRouter,
    addMiddleWare,
    start,
    getStore,
    removeModule,
    _init,
    _run
  }

  return app
}
