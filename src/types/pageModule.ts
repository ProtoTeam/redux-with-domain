import {
  KopActions,
  Func,
  BaseModule,
  SagaEffects,
  SagaEnhancer
} from './common'

type KopSelectors<Selectors> = {
  [K in keyof Selectors]: (...args: any[]) => any
}

export interface PageSelectorsOf<State> {
  [key: string]: (state: State, { payload: any }) => any
}

export interface PageEffectsOf<Selectors, Reducers, Effects> {
  <
    Actions extends KopActions<Reducers, {}> & { [key: string]: Func },
    S extends KopSelectors<Selectors>
  >(params: {
    actions: Actions
    selectors: S
    sagaEffects: SagaEffects
    enhancer: SagaEnhancer
  }): Effects
}

export interface PageModule extends BaseModule {
  injectModules?: string[]
  watchers?: Function[]
}

export interface KopPageModule<Selectors, Reducers, Effects, ActionCreators> {
  namespace: string
  type: symbol // module 分层模块类型
  parent: {}
  presenter: {
    loaded: boolean
  }
  selectors: KopSelectors<Selectors>
  actions: KopActions<Reducers, Effects, ActionCreators>
  injectModules: string[]
  watchers: Func[]
  event: (evt: string) => string
}
