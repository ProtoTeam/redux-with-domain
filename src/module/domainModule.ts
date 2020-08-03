import _ from 'lodash'
import { DOMAIN_MODULE } from '../const'
import createDomainModel from '../helpers/createDomainModel'
import { getModuleState, initModule, getGlobalState } from './util/util'
import { createDomainSelectors } from './options/selector'
import { createDomainEffects } from './options/effects'
import {
  DomainSelectors,
  DomainModule,
  DomainModuleOption,
  KopDomainModule
} from '../types/domainModule'

/**
 * 创建container module
 */
export default function createDomainModule<
  Entities,
  Selectors extends DomainSelectors<Entities> = DomainSelectors<Entities>,
  Effects = {}
>(
  namespace: string,
  pkg: DomainModuleOption<Entities, Selectors, Effects>
): KopDomainModule<Selectors, Entities, Effects> {
  const module = initModule(pkg, namespace, DOMAIN_MODULE) as any

  // 初始化 entities 为 DomainModel
  initEntity<Entities, Selectors, Effects>(module, pkg, namespace)

  // 向 selectors 中注入实际生成的 entities 实例
  initDomainSelectors<Entities, Selectors, Effects>(module, pkg)

  // 注入运行时的实际参数
  initDomainActions<Entities, Selectors, Effects>(
    module,
    pkg as any,
    namespace,
    DOMAIN_MODULE
  )

  return module
}

/*
 * 初始化 domain actions
 * todo：修改了入参
 */
export function initDomainActions<Entities, Selectors, Effects>(
  module: DomainModule,
  pkg: DomainModuleOption<Entities, Selectors, Effects>,
  namespace: string,
  moduleType: symbol
) {
  const { services } = pkg

  module._reducers = _.noop

  module.services = {}

  if (_.isFunction(services)) {
    const { effects, actions } = createDomainEffects(
      namespace,
      module.selectors,
      services,
      module.entities,
      moduleType,
      module
    )

    module.effects = effects
    _.extend(module.services, actions)
  } else {
    // module.services = services
    _.extend(module.services, services)
  }
}

/*
 * 初始化container selectors
 */
function initDomainSelectors<Entities, Selectors, Effects>(
  module: DomainModule,
  pkg: DomainModuleOption<Entities, Selectors, Effects>
) {
  const { selectors = {} } = pkg

  module.selectors = createDomainSelectors(
    { ...selectors, getModuleState, getGlobalState },
    module.entities
  )
}

/**
 * 注入领域模型的实体部分
 * @param module 模块
 * @param pkg 模块的配置
 * @param namespace 模块的命名空间
 */
function initEntity<Entities, Selectors, Effects>(
  module: DomainModule,
  pkg: DomainModuleOption<Entities, Selectors, Effects>,
  namespace: string
) {
  const entities: { [index: string]: any } = {}
  const { entities: entityOps } = pkg

  _.forEach(entityOps, (e, key) => {
    entities[key] = createDomainModel(`${namespace}/@@entity-${key}`, e)
  })

  module.entities = entities
}
