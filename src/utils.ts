import { effects } from 'redux-saga'
import { get, some, replace, isString, keys, has, isEmpty } from 'lodash'
import { MODULE, PRESENTER, ACTION_KIND } from './const'

export function isModule(value) {
  return value && value[MODULE] === MODULE
}

export function isPresenter(value) {
  return value && value[PRESENTER] === PRESENTER
}

export function toStorePath(path) {
  return replace(path, /\//g, '.')
}

// get state by path
// parent module's data aside in .base
export function getStateByNamespace(state, namespace, initialState) {
  const path = toStorePath(namespace)
  const initialStateKeys = keys(initialState)
  const findState = get(state, path)
  if (findState === undefined) {
    throw Error(`Please check if you forget to add module ${path} `)
  }

  if (isEmpty(initialState)) {
    if (findState['@@loading']) {
      return findState
    }
    return get(state, `${path}.base`) // not in base
  }
  let isModuleState = true
  initialStateKeys.forEach(key => {
    if (!has(findState, key)) {
      isModuleState = false
    }
  })
  if (isModuleState) return findState
  return get(state, `${path}.base`)
}

// decorate put and call for tracing
export function decorateSagaEffects(sagaEffects, referrer = '') {
  function put(action) {
    return sagaEffects.put({ ...action, referrer })
  }

  function call(fn, ...params) {
    if (fn.__actionKind) {
      if (fn.__actionKind === ACTION_KIND.EFFECT) {
        return sagaEffects.call(fn.__kopFunction, {
          payload: params.length > 1 ? params : params[0]
        })
      }
      return sagaEffects.put(fn(params.length > 1 ? params : params[0]))
    }
    return sagaEffects.call(fn, ...params)
  }

  return { ...sagaEffects, put, call }
}

export function generateSagaEnhancer(
  events = {},
  namespace: string,
  authCheck?: Function
) {
  function syncPut(action) {
    if (authCheck) authCheck(action, namespace)
    if (action.__actionKind === ACTION_KIND.EFFECT) {
      const res = function*() {
        if (action.__changeLoading) {
          yield effects.put(
            action.__changeLoading({
              key: action.__type,
              value: true
            })
          )
        }
        const result = yield effects.call(action.__kopFunction, {
          payload: action.payload
        })
        if (action.__changeLoading) {
          yield effects.put(
            action.__changeLoading({
              key: action.__type,
              value: false
            })
          )
        }
        return result
      }
      return res()
    }
    return effects.put(action)
  }
  return {
    syncPut,
    ...events
  }
}

export function hasDuplicatedKeys(obj, ...others) {
  return some(obj, (val, key) =>
    some(others, compareItem => {
      if (isString(compareItem)) {
        return compareItem === key
      }
      return key in compareItem
    })
  )
}
