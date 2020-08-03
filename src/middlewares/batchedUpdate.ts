/**
 * @file redux中store变更后, 强制批量更新react
 */

// eslint-disable-next-line @typescript-eslint/camelcase
import { unstable_batchedUpdates } from 'react-dom'

export default function batchedUpdateMiddleware() {
  return (next: Function) => (action: object) =>
    unstable_batchedUpdates(() => next(action))
}
