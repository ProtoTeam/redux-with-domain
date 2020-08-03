import _ from 'lodash'
import * as saga from 'redux-saga'
import {
  toStorePath,
  decorateSagaEffects,
  hasDuplicatedKeys,
  getStateByNamespace
} from '../src/utils'
import { ACTION_KIND } from '../src/const'

describe('utils', () => {
  test('toStorePath', () => {
    expect(toStorePath('a')).toBe('a')
    expect(toStorePath('a/b/c')).toBe('a.b.c')
  })

  describe('getStateByNamespace', () => {
    test('', () => {
      const state = {
        module1: {
          base: {
            count: 2
          }
        }
      }

      let errorMsg = ''
      try {
        getStateByNamespace(state, 'module2', {})
      } catch (e) {
        errorMsg = e.message
      }
      expect(
        _.startsWith(errorMsg, 'Please check if you forget to add module')
      ).toBe(true)
      expect(getStateByNamespace(state, 'module1', {})).toEqual({ count: 2 })
      expect(getStateByNamespace(state, 'module1', { count: 1 })).toEqual({
        count: 2
      })

      const state2 = {
        module1: {
          count: 2
        }
      }
      expect(getStateByNamespace(state2, 'module1', { count: 1 })).toEqual({
        count: 2
      })
    })
  })

  describe('decorateSagaEffects', () => {
    test('put', () => {
      const referrer = 'a'
      const wrappedEffects = decorateSagaEffects(saga.effects, referrer)
      const action = { type: 'update' }
      expect(wrappedEffects.put(action)).toEqual(
        saga.effects.put({ ...action, referrer })
      )
    })

    test('call.normal', () => {
      const wrappedEffects = decorateSagaEffects(saga.effects)
      const fn = () => {
        // do nothing
      }
      expect(wrappedEffects.call(fn)).toEqual(saga.effects.call(fn))
    })

    test('call.reducer', () => {
      const wrappedEffects = decorateSagaEffects(saga.effects)
      const fn = () => ({ type: 'update' })
      fn.__actionKind = ACTION_KIND.REDUCER
      expect(wrappedEffects.call(fn)).toEqual(saga.effects.put(fn()))
    })

    test('call.effect', () => {
      const wrappedEffects = decorateSagaEffects(saga.effects)
      const fn = () => {
        // do nothing
      }
      fn.__actionKind = ACTION_KIND.EFFECT
      fn.__kopFunction = () => {
        // do nothing
      }
      expect(wrappedEffects.call(fn)).toEqual(
        saga.effects.call(fn.__kopFunction, { payload: undefined })
      )
    })
  })

  test('hasDuplicatedKeys', () => {
    expect(hasDuplicatedKeys({ a: 1 }, { b: 2 }, 'a')).toBe(true)
    expect(hasDuplicatedKeys({ a: 1 }, { a: 2, b: 3 }, 'c')).toBe(true)
    expect(hasDuplicatedKeys({ a: 1, b: 2 }, { b: 3, c: 4 }, 'd')).toBe(true)
    expect(hasDuplicatedKeys({ a: 1 }, { b: 2, c: 3 }, 'd')).toBe(false)
  })
})
