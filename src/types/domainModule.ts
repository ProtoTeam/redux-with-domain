import { Action } from 'redux'
import {
  EffectToAction,
  KopSelectors,
  Func,
  StateType,
  BaseEffects,
  BaseReducer,
  BaseModule,
  BaseModuleSelectors,
  SagaEffects,
  SagaEnhancer
} from './common'

type KopActions<Effects> = { [K in keyof Effects]: EffectToAction<Effects[K]> }

export interface KopDomainModule<Selectors, Entities, Effects> {
  entities: DomainEntities<Entities>
  selectors: KopSelectors<Selectors>
  services: KopActions<Effects>
}

/** turn original entites type to entites with crud method */
export type DomainEntities<Entities> = {
  [key in keyof Entities]: {
    actions: {
      insert(data: Entities[key] | Entities[key][]): Action<any>
      delete(id: string | string[]): Action<any>
      update(data: Entities[key] | Entities[key][]): Action<any>
      clear(): Action<any>
    }
    get<T>(
      state: StateType,
      id: T
    ): T extends string
      ? Entities[key]
      : T extends string[]
      ? Entities[key][]
      : never
    get<T>(
      id: T
    ): T extends string
      ? Entities[key]
      : T extends string[]
      ? Entities[key][]
      : never
    select(predicate?: Function): Entities[key][]
    select(state: StateType, predicate?: Function): Entities[key][]
    insert(data: Entities[key] | Entities[key][]): {}
    delete(id: string | string[]): {}
    update(data: Entities[key] | Entities[key][]): {}
    clear(): {}
  }
}

export interface DomainSelectorsOf<Entities> {
  entities: DomainEntities<Entities>
  payload: any
}

export interface DomainSelectors<Entities> {
  [key: string]: ({ entities, payload }: DomainSelectorsOf<Entities>) => any
}

export type EntitiesIdMap<Entities> = {
  [key in keyof Entities]: string
}

export type EffectsToActions<S> = {
  [key in keyof S]: S[key] extends ({
    payload
  }: {
    payload: infer P
  }) => Generator<any, any, any>
    ? (arg: P) => {}
    : S[key]
}

export type DomainService<Entities, Selectors, Effects> = {
  (param: {
    services: EffectsToActions<Effects>
    selectors: Selectors
    entities: DomainEntities<Entities>
    sagaEffects: SagaEffects
    enhancer: SagaEnhancer
  }): Effects
}

export type DomainServices<Selectors> = BaseEffects<Selectors>

export interface DomainModuleOption<Entities, Selectors, Effects> {
  entities: EntitiesIdMap<Entities>
  selectors?: Selectors
  services?: DomainService<Entities, Selectors, Effects>
}

export interface DomainModuleSelectors extends BaseModuleSelectors {
  [index: string]: (...param: any) => any
}

/** internal domain module instance type */
export interface DomainModule extends BaseModule {
  entities?: {
    [key: string]: any
  }
  selectors?: DomainModuleSelectors
  _reducers?: BaseReducer
  services?: object
  effects?: Function[]
}
