import invariant from 'invariant'
import { mapValues, isArray } from 'lodash'
import { Store } from 'redux'

import { KOP_GLOBAL_SELECTOR_LOOP_CHECK } from '../../const'
import { getStateByNamespace } from '../../utils'

declare global {
  interface Window {
    KOP_GLOBAL_SELECTOR_LOOP_CHECK: any
  }
}

window[KOP_GLOBAL_SELECTOR_LOOP_CHECK] =
  window[KOP_GLOBAL_SELECTOR_LOOP_CHECK] || {}

let currentState = null

// check if selector has circular dependency
const selectorLoopChecker = {
  start: (namespace: string, key: string) => {
    if (!window[KOP_GLOBAL_SELECTOR_LOOP_CHECK]) {
      // eslint-disable-next-line @typescript-eslint/camelcase
      window[KOP_GLOBAL_SELECTOR_LOOP_CHECK] = {}
    }
    if (window[KOP_GLOBAL_SELECTOR_LOOP_CHECK][namespace + key] === 1) {
      throw Error(
        `module ${namespace}'s selector ${key} has circular dependency`
      )
    } else {
      window[KOP_GLOBAL_SELECTOR_LOOP_CHECK][namespace + key] = 1
    }
  },
  end: (namespace: string, key: string) => {
    delete window[KOP_GLOBAL_SELECTOR_LOOP_CHECK][namespace + key]
  }
}

function _getStateValue(
  key: string,
  currState: object | null,
  namespace: string,
  initialState: object
) {
  let stateValue

  if (key === 'getGlobalState') {
    stateValue = currState
    invariant(stateValue, 'Please check the kop store')
  } else {
    stateValue = getStateByNamespace(currState, namespace, initialState)

    invariant(
      stateValue,
      `Please check the kop-module ${namespace} is added, or you have return wrong state in last reducer`
    )
  }

  return stateValue
}

export default function initSelectorHelper(store: Store) {
  currentState = store.getState()

  store.subscribe(() => {
    currentState = store.getState()
  })
}

export function createSelectors(namespace, selectors, presenter, initialState) {
  const globalizeSelector = (selector, key) => (...params) => {
    const stateValue = _getStateValue(
      key,
      currentState,
      namespace,
      initialState
    )

    selectorLoopChecker.start(namespace, key)

    if (params[0] === currentState) {
      params.shift()
    }

    const res = presenter.loaded
      ? selector(stateValue, presenter.selectors, ...params)
      : selector(stateValue, null, ...params)

    selectorLoopChecker.end(namespace, key)

    return res
  }

  return mapValues(selectors, globalizeSelector)
}

function _transformSelectors(namespace, selectors, initialState) {
  const globalizeSelector = (selector, key) => (...params) => {
    if (isArray(params) && params.length > 1 && params[0] === currentState) {
      params.shift()
    }
    const stateValue = _getStateValue(
      key,
      currentState,
      namespace,
      initialState
    )

    const res = selector(stateValue, {
      payload: params.length === 1 ? params[0] : params
    })

    return res
  }

  return mapValues(selectors, globalizeSelector)
}

export const createPageSelectors = _transformSelectors
export const createGlobalSelectors = _transformSelectors

export function createDomainSelectors(selectors, entities) {
  const globalizeSelector = selector => (...params) => {
    if (isArray(params) && params.length > 1 && params[0] === currentState) {
      params.shift()
    }

    const res = selector({
      entities,
      payload: params.length === 1 ? params[0] : params
    })

    return res
  }

  return mapValues(selectors, globalizeSelector)
}

export function createContainerSelectors(
  namespace: string,
  selectors: object,
  presenter: { loaded: boolean; selectors: object },
  initialState: object
) {
  const globalizeSelector = (selector: Function, key: string) => (
    ...params
  ) => {
    if (isArray(params) && params.length > 1 && params[0] === currentState) {
      params.shift()
    }

    const stateValue = _getStateValue(
      key,
      currentState,
      namespace,
      initialState
    )

    let res

    if (presenter.loaded) {
      res = selector(stateValue, {
        pageSelectors: presenter.selectors,
        payload: params.length === 1 ? params[0] : params
      })
    } else {
      res = selector(stateValue, {
        payload: params.length === 1 ? params[0] : params
      })
    }

    return res
  }

  return mapValues(selectors, globalizeSelector)
}
