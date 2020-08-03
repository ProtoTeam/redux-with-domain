import { noop } from 'lodash'

import {
  initActions,
  initSelectors,
  initModule,
  initInitialState
} from './util/util'
import { DEFAULT_MODULE } from '../const'

import { ModuleOption } from '../types/classicsModule'

// internal API for create KOP module
export default function createModule(
  namespace: string,
  pkg: ModuleOption,
  type: symbol
) {
  const module = initModule(pkg, namespace, type) as any

  initInitialState(module, pkg)

  initSelectors(module, pkg, namespace, DEFAULT_MODULE)

  const { actions, effects, _reducers, event } = initActions(
    module,
    pkg,
    namespace,
    DEFAULT_MODULE,
    noop
  )

  module.actions = actions

  if (effects) {
    module.effects = effects
  }

  module._reducers = _reducers
  module.event = event

  return module
}
