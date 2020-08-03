import { forEach, isFunction, isArray } from 'lodash'
import { effects } from 'redux-saga'
import { generateSagaEnhancer } from '../../utils'
import { wrapEffectsFunc } from '../util/util'

export function createPageWatchers(
  actions,
  selectors,
  watchersOpt,
  checkAuth,
  namespace
) {
  let sagaEffects = effects
  let enhancer = generateSagaEnhancer({}, namespace)

  if (process.env.NODE_ENV === 'development') {
    sagaEffects = wrapEffectsFunc(checkAuth, namespace)
    enhancer = generateSagaEnhancer({}, namespace, checkAuth)
  }

  const watchers = watchersOpt({
    actions,
    selectors,
    enhancer,
    sagaEffects
  })
  const watcherFns: Function[] = []

  function takeWatch(value, key) {
    if (isArray(value)) {
      watcherFns.push(function*() {
        yield effects[value[1]](key, value[0])
      })
    }

    if (isFunction(value)) {
      watcherFns.push(function*() {
        yield effects.takeEvery(key, value)
      })
    }
  }

  forEach(watchers, (value, key) => {
    const keyArr = key.split(',')
    if (keyArr.length > 1) {
      keyArr.forEach(k => {
        takeWatch(value, k)
      })
    } else {
      takeWatch(value, key)
    }
  })
  return watcherFns
}
