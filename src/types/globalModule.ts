import { KopActions, KopSelectors } from './common'

export type KopGlobalModule<Selectors, Reducers, Effects, ActionCreators> = {
  namespace: string
  selectors: KopSelectors<Selectors>
  actions: KopActions<Reducers, Effects, ActionCreators>
  event: (evt: string) => string
}
