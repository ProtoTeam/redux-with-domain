import { Dispatch, Action } from 'redux'
import { KopSelectors, SagaEffects, SagaEnhancer } from './common'

export interface EffectsParams<Actions, Selectors> {
  actions: Actions
  selectors: KopSelectors<Selectors>
  sagaEffects: SagaEffects
  enhancer: SagaEnhancer
}

export interface ActionCreatorsParams<Actions, Selectors> {
  actions: Actions
  selectors: KopSelectors<Selectors>
  dispatch: Dispatch
  createAction: (type: string) => Action
}
