import update from 'immutability-helper-x'
import { createSelectorCreator, defaultMemoize } from 'reselect'
import _ from 'lodash'
import createModule from '../module/module'
import { ENTITY_MODULE } from '../const'

const arrize = input => {
  if (_.isArray(input)) {
    return input
  }
  return [input]
}

// use _.isEqual instead of === for argument change determine
const createDeepEqualSelector = createSelectorCreator(
  defaultMemoize, // default memoize cache size is 1
  _.isEqual
)

// 实体合并函数，默认是简单的浅合并
const mergeEntity = (target, source) => _.assign({}, target, source)

// 主函数 createDomainModal
export default function createDomainModel(namespace, idKey) {
  const mapIds = (ids, byId) => _.map(ids, id => byId[id])
  const mapIdsMemoized = _.memoize(mapIds, ids => ids.join())
  const getSelector = createDeepEqualSelector(
    [(state, id) => state, (state, id) => id],
    (state, id) => {
      if (_.isArray(id)) {
        // return _.map(id, key => state.byId[key]);
        return mapIdsMemoized(id, state.byId)
      }
      return state.byId[id]
    }
  )
  const selectSelector = createDeepEqualSelector(
    [(state, predicate) => state, (state, predicate) => predicate],
    (state, predicate) => {
      const arr = _.map(state.ids, id => state.byId[id])
      if (predicate) {
        return _.filter(arr, predicate)
      }
      return arr
    }
  )
  const module = {
    /**
     * Kop initialState
     */
    initialState: {
      byId: {},
      ids: []
    },

    /**
     * Kop selectors
     */
    selectors: {
      /**
       * 通过 id 直接拿数据，找不到则为 undefined
       * 例如：
       *  BaseModel.actions.get('xxx');
       * 批量:
       * BaseModel.actions.get(['xxx', 'xxxsss'])
       *
       * @param state
       * @param id
       *
       * @return {Object| Array | undefined}
       */
      get: (state, selectors, id) => {
        console.log(state, selectors, id)
        // ignore selectors and use reselect
        return getSelector(state, id)
      },

      /**
       * 基于lodash的filter实现，你可以从model中选出所有符合条件的实体
       *
       * @param state
       * @param predicate 如果不传predicate，则返回全部数据
       * 例如：
       * BaseModel.actions.select({id: 'xxxx'});
       * 获取全部
       * BaseModel.actions.select();
       *
       * @return {Array|*}
       */
      select: (state, selectors, predicate) =>
        // ignore selectors and use reselect
        selectSelector(state, predicate)
    },

    /**
     * Kop reducers
     */
    // tslint:disable-next-line:object-literal-sort-keys
    reducers: {
      /**
       * 特别说明：每个实体都必须是object，不支持array格式，例如：
       *  支持 { a: 1, b: 2 },
       *  不支持 [1, 2]
       *
       * 插入或者更新实体，支持批量插入或更新
       * 例如：
       *  BaseModel.actions.insert({ id: 'xxxx', a: 1, b: 2 });
       * 批量:
       * BaseModel.actions.insert([
       *   { id: 'xxxx', a: 1, b: 2 },
       *   { id: 'xxxxsss', a: 1, b: 3 },
       * ])
       */
      insert: (state, { payload: data }) => {
        mapIdsMemoized.cache.clear!()
        const arr = arrize(data)
        const ids = _.map(arr, idKey)
        const byId = _.keyBy(arr, idKey)
        return {
          byId: _.chain(state.byId)
            .clone()
            .assignWith(byId, (objValue, srcValue) => {
              if (objValue === undefined) {
                return srcValue
              }
              return mergeEntity(objValue, srcValue)
            })
            .value(),
          ids: _.union(state.ids, ids)
        }
      },

      /**
       * 根据id删除实体，支持批量
       * 例如：
       *  BaseModel.actions.delete('xxxx');
       * 批量
       *  BaseModel.actions.delete(['xxxx', 'xxxxsss']);
       */
      // tslint:disable-next-line:object-literal-sort-keys
      delete: (state, { payload: data }) => {
        mapIdsMemoized.cache.clear!()
        const arr = arrize(data)
        return update(state, {
          byId: { $set: _.omit(state.byId, ...arr) },
          ids: { $set: _.without(state.ids, ...arr) }
        })
      },

      /**
       * 更新实体，支持批量，如果id不存在，则不会插入
       * 例如：
       * BaseModel.actions.update({ [idKey]: 'xxxx', b: 10 });
       * 批量
       * BaseModel.actions.update([
       *   { [idKey]: 'xxxx', b: 10 },
       *   { [idKey]: 'xxxxsss', a: 'lingyi' },
       * ])
       */
      update: (state, { payload: data }) => {
        mapIdsMemoized.cache.clear!()
        const arr = arrize(data)
        const byId = _.keyBy(arr, idKey)
        const re = update.$set(
          state,
          'byId',
          _.mapValues(state.byId, (entity, key) => {
            if (byId[key]) {
              return mergeEntity(entity, byId[key])
            }
            return entity
          })
        )
        return re
      },

      /**
       * 清空数据库
       * 例如：
       * BaseModel.actions.clear(state);
       */
      clear: () => {
        mapIdsMemoized.cache.clear!()
        return { ids: [], byId: {} }
      }
    }
  }

  const res = createModule(namespace, module, ENTITY_MODULE)
  const { actions, selectors } = res as any
  const newActions = {}

  // 转化一层，不用put了
  _.forEach(actions, (action, key) => {
    newActions[key] = (...params) => {
      if (returnModule._store) {
        returnModule._store.dispatch(action(...params))
      }
    }
  })

  const returnModule = {
    ...res,
    ...newActions,
    ...selectors
  }

  return returnModule
}
