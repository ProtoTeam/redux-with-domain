// Object type
export const MODULE = 'MODULE'
export const ACTION = Symbol('ACTION')
export const PRESENTER = Symbol('PRESENTER')

// Module type
export const DEFAULT_MODULE = Symbol('DEFAULT_MODULE')
export const DI_MODULE = Symbol('DI_MODULE')
export const CONTAINER_MODULE = Symbol('CONTAINER_MODULE')
export const PAGE_MODULE = Symbol('PAGE_MODULE')
export const DOMAIN_MODULE = Symbol('DOMAIN_MODULE')
export const ENTITY_MODULE = Symbol('ENTITY_MODULE')
export const GLOBAL_MODULE = Symbol('GLOBAL_MODULE')

// Action type
export const ACTION_KIND = {
  REDUCER: Symbol('REDUCER'),
  EFFECT: Symbol('EFFECT'),
  CREATOR: Symbol('CREATOR')
}

export const CHANGE_LOADING_REDUCER = '@@loading-update'
export const GET_LOADING_SELECTOR = '__getLoadings'

// For test
export const SET_MODULE_STATE_ACTION = 'SET_MODULE_STATE_ACTION'

export const KOP_GLOBAL_STORE_REF = Symbol('KOP_GLOBAL_STORE_REF')
export const KOP_GLOBAL_SELECTOR_LOOP_CHECK = Symbol(
  'KOP_GLOBAL_SELECTOR_LOOP_CHECK'
)
