import * as saga from 'redux-saga'
import { effects } from 'redux-saga'
import createApp from './createApp'

export default createApp

// Type helper for domain
export * from './types/domainModule'
export * from './types/helper'

export {
  createPageModule,
  createDomainModule,
  createContainerModule,
  createGlobalModule
} from './module/index'

export { connect, useDispatch, useSelector, useStore } from 'react-redux'
export { autoGetSet } from './helpers/autoGetSet'

export { effects }
export { saga }
