/*
 * create action
 */
import { forEach } from 'lodash'
import invariant from 'invariant'
import { Func } from 'types/common'
import { ACTION_KIND, KOP_GLOBAL_STORE_REF } from '../../const'

interface ActionOption {
  namespace: string
  actionType: string
  actionKind: symbol
  kopFunction?: Function
  changeLoading?: Function
  moduleType?: symbol
}

export function getActionTypeWithNamespace(
  namespace: string,
  type: string
): string {
  return `${namespace}/${type}`
}

export function createActionCreators({
  namespace,
  module,
  actionCreators,
  moduleType,
  checkAuth
}) {
  const actions = {}

  const createActionWarpper = (type: string) => {
    return createAction({
      namespace,
      actionType: type,
      actionKind: ACTION_KIND.CREATOR,
      moduleType
    })
  }

  let dispatch

  // wrap dispatch for layered call auth check
  if (process.env.NODE_ENV === 'development') {
    dispatch = (action: any) => {
      checkAuth(action, namespace)
      return window[KOP_GLOBAL_STORE_REF].dispatch(action)
    }
  } else {
    dispatch = window[KOP_GLOBAL_STORE_REF].dispatch
  }

  const moduleActionCreators = actionCreators({
    actions: module.actions,
    selectors: module.selectors,
    createAction: createActionWarpper, // helper for create plain action creator
    dispatch
  })

  forEach({ ...moduleActionCreators }, (creator, type) => {
    invariant(
      !module.actions[type],
      `Module ${namespace} action ${type} duplicated`
    )

    // wrap actionCreator to add meta data for the returned action
    if (process.env.NODE_ENV === 'development') {
      actions[type] = actionCreatorWithMetaTag(
        creator,
        namespace,
        moduleType,
        type
      )
    } else {
      actions[type] = creator // directly pass in user defined actionCreator on module.actions
    }
  })

  return {
    actionCreators: actions
  }
}

const actionCreatorWithMetaTag = (
  creator: Func,
  namespace: string,
  moduleType: symbol,
  type: string
) => {
  return (...args) => {
    const action = creator(...args)
    action.__namespace = namespace
    action.__moduleType = moduleType
    action.toString = () => getActionTypeWithNamespace(namespace, type)
    return action
  }
}

export default function createAction({
  namespace,
  actionType,
  actionKind,
  kopFunction,
  changeLoading,
  moduleType
}: ActionOption) {
  const fixedType = getActionTypeWithNamespace(namespace, actionType)

  const action = (
    payload: object,
    meta: object,
    referrer: any,
    error: any
  ) => ({
    payload,
    meta,
    referrer,
    error,
    type: fixedType,
    __namespace: namespace, // meta tag for auth check
    __actionKind: actionKind,
    __type: actionType, // for syncPut auto loading
    __kopFunction: kopFunction, // for syncPut
    __changeLoading: changeLoading, // for syncPut auto loading
    __moduleType: moduleType // meta tag for auth check
  })

  action.type = fixedType
  action.toString = (): string => fixedType // override toString to get namespace and type
  action.__actionKind = actionKind
  action.__kopFunction = kopFunction

  return action
}
