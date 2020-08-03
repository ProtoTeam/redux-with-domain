import _ from 'lodash'
import update from 'immutability-helper-x'
import { SelectorsOf, ReducerOf } from '../types/common'

interface Options {
  initialState: {
    [key: string]: any
  }
  selectors?: SelectorsOf<any>
  reducers?: ReducerOf<any>
}

const firstUpperCase = ([first, ...rest]: string[]): string =>
  first.toUpperCase() + rest.join('')

export function autoGetSet(options: Options): Options {
  const { initialState, selectors, reducers } = options
  const autoSelectors: object = {}
  const autoReducers: object = {}

  _.forEach(initialState, (_value, key: string) => {
    autoSelectors[`get${firstUpperCase(key as any)}`] = state => state[key]

    autoReducers[`set${firstUpperCase(key as any)}`] = (state, { payload }) =>
      update.$set(state, key, payload)
  })

  options.selectors = {
    ...autoSelectors,
    ...selectors
  }

  options.reducers = {
    ...autoReducers,
    ...reducers
  }

  return options
}
