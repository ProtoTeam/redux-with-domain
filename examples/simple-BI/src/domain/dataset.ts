import { createDomainModule } from 'redux-with-domain'
import { quertyDatasetList } from '../api/dataset'

export interface Field {
  id: string // 字段id
  name: string // 字段名称
}

export interface DatasetItem {
  id: string // 数据集id
  name: string // 数据集名称
  type: string // 数据集的类型
  fields: Field[] // 数据集的字段
}

interface Entities {
  datasetList: DatasetItem
}

interface Effects {
  fetchDatasets: (data: { payload: string[] }) => any
}

export default createDomainModule<Entities, {}, Effects>('domain/dataset', {
  entities: {
    datasetList: 'id'
  },
  selectors: {}, // 占位
  services: ({ entities, sagaEffects: { put, call } }) => ({
    *fetchDatasets({ payload }: { payload: string[] }) {
      // 请求图表详情
      const datasets = yield call(quertyDatasetList, payload)
      // 保存值
      entities.datasetList.insert(datasets)
    }
  })
})
