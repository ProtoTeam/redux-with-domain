import { createDomainModule, DomainEntities } from 'redux-with-domain'

export interface Workbook {
  id: string // 工作簿id
  name: string // 工作簿名称
  datasetIdList: string[] // 引用的数据集id列表
  reportIdList: string[] // 创建的报表id列表
}

interface Entities {
  workbookList: Workbook
}

const selectors = {
  getWorkbook: ({ entities }: { entities: DomainEntities<Entities> }) => {
    return entities.workbookList.select()
  }
}

export default createDomainModule<Entities, typeof selectors, {}>(
  'domain/workbook',
  {
    entities: {
      workbookList: 'id'
    },
    selectors: {
      getWorkbook: ({ entities }) => {
        return entities.workbookList.select() as Workbook[]
      }
    },
    services: ({ entities, sagaEffects: { call, put } }) => ({
      // dosomething
    })
  }
)
