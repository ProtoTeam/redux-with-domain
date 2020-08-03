import { extend } from 'lodash'
import { GLOBAL_MODULE } from '../const'
import {
  initInitialState,
  initModule,
  initSelectors,
  initActions
} from './util/util'
import { getAuthCheck } from './options/effects'
import { SelectorsOf, ReducerOf, EffectsOf, ActionsOf } from '../types/common'
import { KopGlobalModule } from '../types/globalModule'

export default function createGlobalModule<
  State = {},
  Selectors extends SelectorsOf<State> = SelectorsOf<State>,
  Reducers extends ReducerOf<State> = ReducerOf<State>,
  Effects = {},
  ActionCreators = {}
>(
  namespace: string,
  pkg: {
    initialState?: State
    selectors?: Selectors
    reducers?: Reducers
    effects?: EffectsOf<Selectors, Reducers, Effects>
    effectLoading?: boolean
    actionCreators?: ActionsOf<ActionCreators, Reducers, Effects, Selectors>
  }
): KopGlobalModule<Selectors, Reducers, Effects, ActionCreators> {
  const type = GLOBAL_MODULE
  const module = initModule(pkg, namespace, type) as any

  initInitialState(module, pkg)
  initSelectors(module, pkg, namespace, type)

  module.actions = {}

  const { actions, effects, _reducers, event, actionCreators } = initActions(
    module,
    pkg,
    namespace,
    type,
    getAuthCheck[type]
  )

  extend(module.actions, actionCreators, actions)

  module._reducers = _reducers
  module.event = event

  if (effects) {
    module.effects = effects
  }

  return module
}
