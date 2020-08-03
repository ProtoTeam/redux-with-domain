import { createDomainModule } from 'redux-with-domain'
import { quertyReportChartInfo } from '../api/report'

export interface Attr {
  max?: number
  group: string
  fields: string[]
  fieldsName?: string[]
}

export interface Chart {
  id: string
  reportId: string
  datasetId: string
  name: string
  attribute: Attr[]
  type: string
}

interface Entities {
  chart: Chart
}

const selectors = {} // 占位

type Effects = {
  fetchCharts: (data: { payload: string }) => any
}

export default createDomainModule<Entities, typeof selectors, Effects>(
  'domain/chart',
  {
    entities: {
      chart: 'id'
    },
    selectors,
    services: ({ services, entities, sagaEffects: { call } }) => ({
      *fetchCharts({ payload }) {
        // 如果之前已经请求过，不用重复请求
        const charts = entities.chart.get(payload)
        if (charts) {
          return
        }
        // 请求图表详情
        const reportInfo: Chart = yield call(quertyReportChartInfo, payload)
        // 保存值
        entities.chart.insert(reportInfo)
      }
    })
  }
)
