import invariant from 'invariant'
import { extend, forEach, isArray, isUndefined } from 'lodash'
import { effects } from 'redux-saga'

import { WrappedAction } from 'types/common'
import {
  ACTION_KIND,
  DOMAIN_MODULE,
  CHANGE_LOADING_REDUCER,
  PAGE_MODULE,
  CONTAINER_MODULE,
  GLOBAL_MODULE
} from '../../const'
import createAction, { getActionTypeWithNamespace } from './action'
import { decorateSagaEffects } from '../../utils'
import { getWrappedEffectOptions } from '../util/util'

function transformEffects({
  moduleEffects,
  normalActions,
  namespace,
  moduleType,
  effectLoading
}) {
  const sagaFns: Function[] = []
  const effectActions = {} // saga action

  forEach({ ...moduleEffects }, (value, type) => {
    invariant(
      !normalActions[type],
      `Module ${namespace} action ${type} duplicated`
    )

    const actionType = getActionTypeWithNamespace(namespace, type)
    let generator
    let helper = effects.takeEvery
    let args: Array<any> = [] // extra args for saga

    if (isArray(value)) {
      generator = value[0]
      const helperName = value[1]
      helper = effects[helperName]
      invariant(
        helper,
        `Module ${namespace} effect ${type} use invalid helper ${helperName}`
      )
      if (!isUndefined(value[2])) {
        args = value.slice(2)
      }
    } else {
      generator = value
    }

    sagaFns.push(function*() {
      // fix redux-saga's bug
      // https://github.com/redux-saga/redux-saga/issues/1482
      yield (helper as any)(
        actionType,
        function*(...params) {
          try {
            if (effectLoading) {
              if (DOMAIN_MODULE !== moduleType) {
                yield effects.put(
                  normalActions[CHANGE_LOADING_REDUCER]({
                    key: type,
                    value: true
                  })
                )
              }
            }
            yield generator(...params)
            if (effectLoading) {
              if (DOMAIN_MODULE !== moduleType) {
                yield effects.put(
                  normalActions[CHANGE_LOADING_REDUCER]({
                    key: type,
                    value: false
                  })
                )
              }
            }
          } catch (e) {
            if (effectLoading) {
              if (DOMAIN_MODULE !== moduleType) {
                yield effects.put(
                  normalActions[CHANGE_LOADING_REDUCER]({
                    key: type,
                    value: false
                  })
                )
              }
            }

            console.error(e)
          }
        },
        ...args
      )
    })

    effectActions[type] = createAction({
      namespace,
      moduleType,
      actionType: type,
      actionKind: ACTION_KIND.EFFECT,
      kopFunction: generator,
      changeLoading: normalActions[CHANGE_LOADING_REDUCER]
    })
  })

  return { sagaFns, effectActions }
}

export default function createEffectsAndActions(
  namespace: string,
  normalActions,
  selectors,
  events,
  effectsOpt
) {
  const allActions = {}
  const effectActions = {}

  const sagaEffects = decorateSagaEffects(effects)

  const moduleEffects = effectsOpt(allActions, selectors, sagaEffects, events)
  const sagas: Function[] = []

  forEach({ ...moduleEffects }, (value, type) => {
    invariant(
      !normalActions[type],
      `Module ${namespace} action ${type} duplicated`
    )

    const actionType = getActionTypeWithNamespace(namespace, type)
    let generator
    let helper = effects.takeEvery // default helper is takeEvery
    let args: Array<any> = []

    if (isArray(value)) {
      const helperName = value[1] // effect function
      generator = value[0] // saga function
      helper = effects[helperName]

      invariant(
        helper,
        `Module ${namespace} effect ${type} use invalid helper ${helperName}`
      )

      if (!isUndefined(value[2])) {
        args = value.slice(2)
      }
    } else {
      generator = value
    }

    sagas.push(function*() {
      // fix redux-saga's bug
      // https://github.com/redux-saga/redux-saga/issues/1482
      yield (helper as any)(actionType, generator, ...args)
    })

    effectActions[type] = createAction({
      namespace,
      actionType: type,
      actionKind: ACTION_KIND.EFFECT,
      kopFunction: generator
    })
  })

  extend(allActions, normalActions, effectActions) // merge actions

  return {
    effectActions,
    allActions,
    effects: sagas
  }
}

// auth check for effects
export const getAuthCheck = {
  // RULE: cannot call other page's action
  [PAGE_MODULE]: (action: WrappedAction, currentNamespace: string) => {
    const actionModuleType = action.__moduleType
    const actionNamespace = action.__namespace
    const notOwnPageModuleAction =
      PAGE_MODULE === actionModuleType && currentNamespace !== actionNamespace
    if (notOwnPageModuleAction) {
      throw new Error(
        'Page module can dispatch own actions, container module actions and domain module actions~'
      )
    }

    return true
  },
  // RULE: cannot call other container and page's action
  [CONTAINER_MODULE]: (action: WrappedAction, currentNamespace: string) => {
    const isPageModuleAction = PAGE_MODULE === action.__moduleType
    const notOwnContainerActions =
      CONTAINER_MODULE === action.__moduleType &&
      currentNamespace !== action.__namespace
    if (isPageModuleAction || notOwnContainerActions) {
      throw new Error(
        'Container module can only dispatch own actions or domain module actions'
      )
    }

    return true
  },
  // RULE: cannot call container, page and other domain's action
  [DOMAIN_MODULE]: (action: WrappedAction, currentNamespace: string) => {
    const isPageOrContainerModuleAction =
      PAGE_MODULE === action.__moduleType ||
      CONTAINER_MODULE === action.__moduleType
    const notOwnDomainActions =
      DOMAIN_MODULE === action.__moduleType &&
      currentNamespace !== action.__namespace
    if (isPageOrContainerModuleAction || notOwnDomainActions) {
      throw new Error('Domain module can only dispatch own actions')
    }
  },
  // RULE: can only dipatch its own actions
  [GLOBAL_MODULE]: (action: WrappedAction, currentNamespace: string) => {
    const valid =
      GLOBAL_MODULE === action.__moduleType &&
      currentNamespace === action.__namespace
    if (!valid) {
      throw new Error('Global module can only dispatch its own actions')
    }
    return true
  }
}

// internal method for get effects and actions
function _getEffectsAndActions(
  namespace,
  normalActions,
  selectors,
  events,
  effectsOpt,
  moduleType,
  effectLoading
) {
  const allActions = {}

  const { enhancer, sagaEffects } = getWrappedEffectOptions(
    moduleType,
    namespace,
    events
  )

  const moduleEffects = effectsOpt({
    enhancer,
    selectors,
    actions: allActions,
    sagaEffects
  })

  const { sagaFns, effectActions } = transformEffects({
    moduleEffects,
    normalActions,
    namespace,
    moduleType,
    effectLoading
  })

  extend(allActions, normalActions, effectActions) // merge actions

  return {
    effectActions,
    allActions,
    effects: sagaFns
  }
}

export const createPageEffects = _getEffectsAndActions
export const createContainerEffects = _getEffectsAndActions
export const createGlobalEffects = _getEffectsAndActions

export function createDomainEffects(
  namespace,
  selectors,
  servicesOpt,
  entities,
  moduleType,
  module
) {
  const allActions = {}

  const { enhancer, sagaEffects } = getWrappedEffectOptions(
    moduleType,
    namespace,
    {}
  )

  const moduleEffects = servicesOpt({
    selectors,
    enhancer,
    entities,
    services: module.services,
    sagaEffects
  })

  moduleEffects.__reset = () => {
    forEach(entities, v => {
      v.__reset()
    })
  }

  const { sagaFns, effectActions } = transformEffects({
    moduleEffects,
    normalActions: {},
    namespace,
    moduleType,
    effectLoading: false
  })

  return {
    actions: effectActions,
    effects: sagaFns
  }
}
