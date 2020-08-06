import { Store as ReduxStore, Dispatch, Reducer, Middleware } from 'redux'
import { DefaultReducer } from './common'

export interface Store extends ReduxStore {
  dispatch: Dispatch<any>
  replaceReducer: (nextReducer: Reducer<any, any>) => void
}

export interface Presenter {
  actions?: { [key: string]: Function }
  injectModules?: string[]
  selectors?: { [key: string]: Function }
}

export interface Module {
  effectLoading?: boolean
  actions?: { [key: string]: Function }
  entities?: {
    [key: string]: Module
  }
  effects?: Function[]
  watchers?: Function[]
  event?: (evt: string) => string
  injectModules: string[]
  namespace: string
  parent?: Record<string, any>
  presenter?: {
    loaded: boolean
    selectors: { [key: string]: Function }
    actions: { [key: string]: Function }
  }
  reset: Function
  selectors?: { [key: string]: Function }
  services?: { [key: string]: Function }
  setup: Function
  type: symbol
  _store: Store
}

export interface Modules {
  [key: string]: Module
}

export interface App {
  _store?: Store
  _modules?: {
    [key: string]: Module
  }
  _init: Function
  _run: Function
  _middleWares?: Middleware<{}>[]
  _router?: Record<string, any>
  addModule: Function
  addPage: Function
  addDomain: Function
  addGlobal: Function
  addRouter: Function
  addMiddleWare: Function
  removeModule: Function
  start: Function
  getStore: Function
}

export interface CreateOpt {
  multiInstance?: boolean
  initialReducer?: {
    [key: string]: Function
  }
  onError?: Function
}

export interface PageOption {
  containers?: Module[]
}

export interface ReducerHandler {
  [propName: string]: Function
}

export interface ParentNode {
  _initialState: object
  _reducers: {
    [index: string]: Function
  }
  _defaultReducer?: DefaultReducer<any>
}
