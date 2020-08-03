import { extend } from 'lodash'
import { CONTAINER_MODULE } from '../const'
import {
  initInitialState,
  initModule,
  initSelectors,
  initActions
} from './util/util'
import { getAuthCheck } from './options/effects'
import {
  SelectorsOf,
  ReducerOf,
  EffectsOf,
  ActionsOf,
  DefaultReducer
} from '../types/common'
import { KopContainerModule } from '../types/containerModule'

export default function createContainerModule<
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
    defaultReducer?: DefaultReducer<State>
    effects?: EffectsOf<Selectors, Reducers, Effects>
    effectLoading?: boolean
    actionCreators?: ActionsOf<ActionCreators, Reducers, Effects, Selectors>
  }
): KopContainerModule<Selectors, Reducers, Effects, ActionCreators> {
  const module = initModule(pkg, namespace, CONTAINER_MODULE) as any

  initInitialState(module, pkg)

  initSelectors(module, pkg, namespace, CONTAINER_MODULE)

  module.actions = {}

  const { actions, effects, _reducers, event, actionCreators } = initActions(
    module,
    pkg,
    namespace,
    CONTAINER_MODULE,
    getAuthCheck[CONTAINER_MODULE]
  )

  extend(module.actions, actionCreators, actions)

  module._reducers = _reducers
  module._defaultReducer = pkg.defaultReducer
  module.event = event

  if (effects) {
    module.effects = effects
  }

  return module
}
