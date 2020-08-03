import { isFunction, extend } from 'lodash'
import {
  initInitialState,
  initModule,
  initActions,
  initSelectors
} from './util/util'
import { createPageWatchers } from './options/watchers'
import { getAuthCheck } from './options/effects'
import { PAGE_MODULE } from '../const'
import {
  SelectorsOf,
  ReducerOf,
  ActionsOf,
  DefaultReducer
} from '../types/common'
import { PageEffectsOf, PageModule, KopPageModule } from '../types/pageModule'
import { KopContainerModule } from '../types/containerModule'

interface PageOptions<
  State,
  Selectors,
  Reducers,
  Effects,
  Watchers,
  ActionCreators
> {
  initialState?: State
  selectors?: Selectors
  reducers?: Reducers
  defaultReducer?: DefaultReducer<State>
  injectModules?: KopContainerModule<{}, {}, {}, {}>[]
  effects?: PageEffectsOf<Selectors, Reducers, Effects>
  watchers?: PageEffectsOf<Selectors, Reducers, Watchers>
  effectLoading?: boolean
  actionCreators?: ActionsOf<ActionCreators, Reducers, Effects, Selectors>
}

function initInjectModules<
  State,
  Selectors,
  Reducers,
  Effects,
  Watchers,
  ActionCreators
>(
  module: PageModule,
  pkg: PageOptions<
    State,
    Selectors,
    Reducers,
    Effects,
    Watchers,
    ActionCreators
  >
) {
  const { injectModules = [] } = pkg

  module.injectModules = injectModules.map(m => m.namespace)
}

function initPageWatchers<
  State,
  Selectors,
  Reducers,
  Effects,
  Watchers,
  ActionCreators
>(
  module: PageModule,
  pkg: PageOptions<
    State,
    Selectors,
    Reducers,
    Effects,
    Watchers,
    ActionCreators
  >
) {
  const { namespace } = module

  if (isFunction(pkg.watchers)) {
    module.watchers = createPageWatchers(
      module.actions,
      module.selectors,
      pkg.watchers,
      getAuthCheck[PAGE_MODULE],
      namespace
    )
  }
}

export default function createPageModule<
  State,
  Selectors extends SelectorsOf<State> = SelectorsOf<State>,
  Reducers extends ReducerOf<State> = ReducerOf<State>,
  Effects = {},
  Watchers = {},
  ActionCreators = {}
>(
  namespace: string,
  pkg: PageOptions<
    State,
    Selectors,
    Reducers,
    Effects,
    Watchers,
    ActionCreators
  >
): KopPageModule<Selectors, Reducers, Effects, ActionCreators> {
  const module = initModule(pkg, namespace, PAGE_MODULE) as any

  initInitialState(module, pkg)

  initSelectors(module, pkg, namespace, PAGE_MODULE)

  initInjectModules(module, pkg)

  module.actions = {}

  const { actions, effects, _reducers, event, actionCreators } = initActions(
    module,
    pkg,
    namespace,
    PAGE_MODULE,
    getAuthCheck[PAGE_MODULE]
  )

  extend(module.actions, actionCreators, actions)

  if (effects) {
    module.effects = effects
  }

  module._reducers = _reducers
  module._defaultReducer = pkg.defaultReducer
  module.event = event

  initPageWatchers(module, pkg)

  return module
}
