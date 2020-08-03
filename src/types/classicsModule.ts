import { EffectsOf } from './common'

export interface ModuleOption<
  State = {},
  Selectors = {},
  Reducers = {},
  Effects = {}
> {
  initialState: State
  selectors?: Selectors
  reducers?: Reducers
  effects?: EffectsOf<Reducers, Selectors, Effects>
}
