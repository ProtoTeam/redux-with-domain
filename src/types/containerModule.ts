import { KopActions, KopSelectors } from './common'

export type KopContainerModule<Selectors, Reducers, Effects, ActionCreators> = {
  namespace: string
  selectors: KopSelectors<Selectors>
  actions: KopActions<Reducers, Effects, ActionCreators>
  event: (evt: string) => string
}

export interface GlobalState {
  [index: string]: any
}
