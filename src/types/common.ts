import { Action } from 'redux'
import { effects, Effect } from 'redux-saga'
import { GlobalState } from './containerModule'

export interface DefaultReducer<State> {
  (state: State, action: Action<any>): State
}

export interface SagaEnhancer {
  emit: Func
  take: Func
  syncPut: Func
}

export interface SagaEffects {
  take: typeof effects.take
  put: typeof effects.put
  all: typeof effects.all
  race: typeof effects.race
  call: typeof effects.call
  apply: typeof effects.apply
  cps: typeof effects.cps
  fork: typeof effects.fork
  spawn: typeof effects.spawn
  join: typeof effects.join
  cancel: typeof effects.cancel
  select: typeof effects.select
  actionChannel: typeof effects.actionChannel
  flush: typeof effects.flush
  getContext: typeof effects.getContext
  setContext: typeof effects.setContext
  takeEvery: typeof effects.takeEvery
  takeLatest: typeof effects.takeLatest
  throttle: typeof effects.throttle
}

export interface Func {
  (...args: any[]): any
}

// object
export interface SelectorsOf<State> {
  [key: string]: (state: State, ...args: any[]) => any
}

// object
export interface ReducerOf<State> {
  [key: string]: (state: State, action: { type: string; payload: any }) => State
}

export interface ActionsOf<ActionCreators, Reducers, Effects, Selectors> {
  <S extends KopSelectors<Selectors>>(param: {
    actions: any
    selectors: S
    dispatch: Func
    createAction: (type: string) => Action
  }): ActionCreators
}

// function
export interface EffectsOf<Selectors, Reducers, Effects> {
  <S extends KopSelectors<Selectors>>(param: {
    actions: any
    selectors: S
    sagaEffects: SagaEffects
    enhancer: SagaEnhancer
  }): Effects
}
// end create module ///////////////////////////////////////////////////////////////////

// Generate a typed Kop Module from its selectors, reducers, effects.
// Pick payload in a reducer/effect.
export type ReducerToAction<Reducer> = Reducer extends (
  state: any,
  action: infer A
) => any
  ? A extends { payload: infer P }
    ? (payload: P) => any
    : () => any
  : never

export type EffectToAction<Effect> = Effect extends () => any
  ? () => any
  : Effect extends (payload: { payload: infer P }) => any
  ? (payload: P) => any
  : never

// kop module 限制
// Generate actions from reducers/effects.
export type KopActions<Reducers, Effects, ActionCreators = {}> = {
  [K in keyof Reducers]: ReducerToAction<Reducers[K]>
} &
  { [K in keyof Effects]: EffectToAction<Effects[K]> } &
  ActionCreators

// Generate kop selectors from module selectors
export interface CommonSelectors {
  getModuleState: Func
  getGlobalState: Func
  __getLoadings: (state: GlobalState) => { [key: string]: boolean }
}

export type KopSelectors<T> = {
  [P in keyof T]: T[P] extends (state: any) => infer A
    ? (state: GlobalState) => A
    : T[P] extends (state: any, payload: { payload: infer B }) => infer A
    ? (state: GlobalState, payload: B) => A
    : T[P] extends (state: any, payload: any) => infer A
    ? (state: GlobalState, payload: any) => A
    : (state: GlobalState) => any
} &
  CommonSelectors

export interface KopModule<Selectors, Reducers, Effects> {
  selectors?: KopSelectors<Selectors>
  actions?: KopActions<Reducers, Effects>
  event?: (evt: string) => string
  setup?: Func
  reset?: Func
}
// end kop module ///////////////////////////////////////////////////////////////////

// ///////////////////////////////////////////////
export interface WrappedAction {
  type: string
  __namespace: string
  __actionKind: symbol
  __type: string // actionType
  __kopFunction: Function
  __changeLoading: Function
  __moduleType: symbol
  toString: Function
}

export interface BaseAction {
  type: string
  payload: any
}

export interface BaseSelectors<State> {
  [key: string]: (state: State, ...args: any[]) => any
}

export interface BaseReducers<State> {
  [key: string]: (state: State, action: BaseAction) => State
}

export interface Enhancer {
  syncPut: Effect
  emit: Function
}

export interface BaseEffects<Selector> {
  (actions, selectors: Selector, sagaEffects, enhancer: Enhancer): {
    [key: string]: Effect
  }
}

export interface BaseModuleOption<State> {
  initialState: State
  selectors: BaseSelectors<State>
  reducers: BaseReducers<State>
  effects: BaseEffects<BaseSelectors<State>>
}

// todo
export interface BaseModuleActions {
  [index: string]: (...param: any) => any
}

export interface BaseModuleSelectors {
  [index: string]: (...param: any) => any
}

export interface BaseReducer {
  (state: object): any
}

export interface BaseModule {
  // initModule 阶段写入
  namespace: string
  type: symbol // module 分层模块类型
  parent: object
  presenter: {
    loaded: boolean
  }
  // initInitialState 的阶段写入
  _initialState?: {
    '@@loading': boolean
    [key: string]: any
  }
  // initSelectors  的阶段写入
  selectors?: BaseModuleSelectors
  // initActions 的阶段写入
  _reducers?: BaseReducer
  event?: any
  actions?: BaseModuleActions
  // initLifeCycle 的阶段写入
  setup?: Func // 已废弃
  reset?: Func // 已废弃
  lifecycle?: Func
}

export interface StateType {
  [index: string]: any
}
