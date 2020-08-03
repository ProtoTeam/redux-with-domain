import invariant from 'invariant'
import { forEach, cloneDeep, isFunction } from 'lodash'
import { effects } from 'redux-saga'
import update from 'immutability-helper-x'

import {
  createSelectors,
  createPageSelectors,
  createContainerSelectors,
  createGlobalSelectors
} from '../options/selector'
import createEffectsAndActions, {
  createPageEffects,
  createContainerEffects,
  createGlobalEffects,
  getAuthCheck
} from '../options/effects'
import { generateSagaEnhancer } from '../../utils'
import {
  MODULE,
  ACTION_KIND,
  PAGE_MODULE,
  CONTAINER_MODULE,
  CHANGE_LOADING_REDUCER,
  GET_LOADING_SELECTOR,
  GLOBAL_MODULE
} from '../../const'
import createAction, {
  getActionTypeWithNamespace,
  createActionCreators
} from '../options/action'

type EffectsType = typeof effects

export function parseActionsAndReducers(
  namespace: string,
  reducerMap,
  moduleType
) {
  const actions = {}
  const reducers = {}
  forEach(reducerMap, (reducer, actionType) => {
    const actionTypeWithNamespace = getActionTypeWithNamespace(
      namespace,
      actionType
    )
    reducers[actionTypeWithNamespace] = reducer
    actions[actionType] = createAction({
      namespace,
      actionType,
      moduleType,
      actionKind: ACTION_KIND.REDUCER
    })
  })

  return {
    actions,
    reducers
  }
}

export function getModuleState(state) {
  return state
}

export function getGlobalState(state) {
  return state
}

export function initInitialState(module, pkg) {
  const { initialState = {} } = pkg
  module._initialState = cloneDeep(initialState)
  module._initialState['@@loading'] = {}
}

export const initModule = (pkg, namespace: string, type: symbol) => {
  invariant(namespace.indexOf(',') === -1, 'Module name can not contain " , "')

  return {
    namespace,
    type,
    [MODULE]: MODULE,
    parent: {},
    presenter: {
      loaded: false
    }
  }
}

// wrap saga effects with check auth
export function wrapEffectsFunc(authCheck, namespace) {
  const wrapEffects = {}
  forEach(effects, (value, key) => {
    if (key === 'put') {
      wrapEffects[key] = (...args) => {
        const action = args && args[0]
        authCheck(action, namespace)
        return (value as Function)(...args)
      }
    } else {
      wrapEffects[key] = value
    }
  })
  return wrapEffects as EffectsType
}

export function initActions(
  module,
  pkg,
  namespace,
  moduleType,
  authCheck?: Function
) {
  const { initialState = {}, reducers, effectLoading = false } = pkg

  // internal reducer for reset state
  const __reset = () => ({
    ...initialState,
    '@@loading': {}
  })

  const changeLoading = (state, { payload }) => {
    if (state['@@loading']) {
      return update(state, {
        '@@loading': {
          [payload.key]: {
            $set: payload.value
          }
        }
      })
    }
    const loading = {
      [payload.key]: payload.value
    }
    return update(state, {
      '@@loading': {
        $set: loading
      }
    })
  }
  const reducersWithDefault = {
    ...reducers,
    __reset,
    [CHANGE_LOADING_REDUCER]: changeLoading
  }
  const getEventCompleteType = name => `${namespace}/_EVENT_${name}_`
  const emit = ({ name, payload }) =>
    effects.put({
      payload,
      type: getEventCompleteType(name)
    })
  const take = name => effects.take(getEventCompleteType(name))

  const actionsAndReducers = parseActionsAndReducers(
    namespace,
    reducersWithDefault,
    moduleType
  )

  const normalActions = actionsAndReducers.actions

  let actionCreators = {}

  if (pkg.actionCreators) {
    actionCreators = initActionCreators(
      module,
      pkg,
      namespace,
      moduleType,
      authCheck
    )
  }

  // extract actions from effects
  if (isFunction(pkg.effects)) {
    let data: any = {}

    switch (moduleType) {
      case PAGE_MODULE:
        data = createPageEffects(
          namespace,
          normalActions,
          module.selectors,
          { emit, take },
          pkg.effects,
          moduleType,
          effectLoading
        )
        break
      case CONTAINER_MODULE:
        data = createContainerEffects(
          namespace,
          normalActions,
          module.selectors,
          { emit, take },
          pkg.effects,
          moduleType,
          effectLoading
        )
        break
      case GLOBAL_MODULE:
        data = createGlobalEffects(
          namespace,
          normalActions,
          module.selectors,
          { emit, take },
          pkg.effects,
          moduleType,
          effectLoading
        )
        break
      default:
        data = createEffectsAndActions(
          namespace,
          normalActions,
          module.selectors,
          { emit, take },
          pkg.effects
        )
    }

    return {
      actions: data.allActions, // actions = reducers actions + effects actions
      effects: data.effects,
      _reducers: actionsAndReducers.reducers,
      event: getEventCompleteType,
      actionCreators
    }
  }
  return {
    _reducers: actionsAndReducers.reducers,
    actions: normalActions,
    event: getEventCompleteType,
    actionCreators
  }
}

export function initSelectors(module, pkg, namespace, moduleType) {
  const { selectors = {}, initialState = {} } = pkg

  selectors[GET_LOADING_SELECTOR] = state => state['@@loading'] || {}

  let moduleSelectors

  switch (moduleType) {
    case PAGE_MODULE:
      moduleSelectors = createPageSelectors(
        namespace,
        { ...selectors, getModuleState, getGlobalState },
        initialState
      )
      break
    case CONTAINER_MODULE:
      moduleSelectors = createContainerSelectors(
        namespace,
        { ...selectors, getModuleState, getGlobalState },
        module.presenter,
        initialState
      )
      break
    case GLOBAL_MODULE:
      moduleSelectors = createGlobalSelectors(
        namespace,
        { ...selectors, getModuleState, getGlobalState },
        initialState
      )
      break
    default:
      moduleSelectors = createSelectors(
        namespace,
        { ...selectors, getModuleState, getGlobalState },
        module.presenter,
        initialState
      )
  }

  module.selectors = moduleSelectors
}

export function initActionCreators(
  module,
  pkg,
  namespace,
  moduleType,
  checkAuth
) {
  const { actionCreators } = createActionCreators({
    namespace,
    module,
    actionCreators: pkg.actionCreators,
    moduleType,
    checkAuth
  })

  return actionCreators
}

export function getWrappedEffectOptions(
  moduleType: symbol,
  namespace: string,
  events: any
) {
  const authCheck = getAuthCheck[moduleType]
  let enhancer = generateSagaEnhancer(events, namespace)
  let effectsFunc = effects

  if (process.env.NODE_ENV === 'development') {
    effectsFunc = wrapEffectsFunc(authCheck, namespace)
    enhancer = generateSagaEnhancer(events, namespace, authCheck)
  }
  return {
    sagaEffects: effectsFunc,
    enhancer
  }
}
