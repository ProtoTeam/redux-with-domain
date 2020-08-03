import _ from 'lodash'
import { createContainerModule, EffectsParams } from 'redux-with-domain'
import chartDomain, { Attr, Chart } from '../../../domain/chart'
import datasetDomain, { DatasetItem } from '../../../domain/dataset'
import { Action } from 'redux'

// 向页面抛出选中报表的数据集改变的事件名
export const kDatasetIdChangeEmitName = 'setDatasetId'

export interface State {
  selectedChartId: string
  loading: boolean
}

interface InjectActions {
  setLoading: (flag: boolean) => Action
  queryChart: (id: string) => Action
  saveSelectedChartId: (id: string) => Action
}

type Selector = typeof selectors
type Effects = ReturnType<typeof effects>

const initialState = {
  selectedChartId: '',
  loading: false
}

const selectors = {
  getLoading: (state: State) => {
    return state.loading
  },
  getCharts: (state: State, { payload: reportId }: { payload: string }) => {
    const chart = chartDomain.entities.chart.select({ reportId })

    return chart.map((chart: Chart) => {
      let attributes: Attr[] | undefined = _.get(chart, 'attribute')

      if (attributes && attributes.length > 0) {
        attributes = attributes.map(item => {
          const fields = item.fields || []
          const dataset: DatasetItem = datasetDomain.entities.datasetList.get(
            chart.datasetId
          )
          const fieldsName = !dataset
            ? []
            : dataset.fields
                .filter(field => fields.includes(field.id))
                .map(field => field.name)

          return {
            ...item,
            fieldsName: fieldsName
          }
        })
      }
      return {
        ...chart,
        attribute: attributes
      }
    })
  },
  getSelectedChartId: (state: State) => {
    return state.selectedChartId
  }
}

const reducers = {
  setLoading: (state: State, { payload }: { payload: boolean }) => {
    return {
      ...state,
      loading: payload
    }
  },
  saveSelectedChartId: (state: State, { payload }: { payload: string }) => {
    return {
      ...state,
      selectedChartId: payload
    }
  }
}

const effects = ({
  actions,
  selectors,
  sagaEffects: { call, put, select },
  enhancer: { emit, syncPut }
}: EffectsParams<InjectActions, Selector>) => ({
  *reloadChart({ payload: reportId }: { payload: string }) {
    // 转圈圈
    yield syncPut(actions.setLoading(true))
    // 拉取图表信息
    const charts: Chart[] =
      chartDomain.entities.chart.select({ reportId }) || []
    if (charts.length === 0) {
      yield syncPut(actions.queryChart(reportId))
    }
    // 停止转圈圈
    yield syncPut(actions.setLoading(false))
  },
  *queryChart({ payload }: { payload: string }) {
    // 查询图表信息
    yield syncPut(chartDomain.services.fetchCharts(payload))
    // 查询图表依赖的数据集
    const charts: Chart[] = chartDomain.entities.chart.select()
    const datasetIdList: string[] = []
    charts.forEach(element => {
      const datasetId = element.datasetId
      if (!datasetIdList.includes(datasetId)) {
        datasetIdList.push(element.datasetId)
      }
    })
    yield syncPut(datasetDomain.services.fetchDatasets(datasetIdList))
  },
  *setSelectedChart({ payload }: { payload: string }) {
    yield syncPut(actions.saveSelectedChartId(payload))
    const chart = chartDomain.entities.chart.get(payload)
    const { datasetId } = chart
    // 向页面抛出图表依赖的数据集变更的事件
    yield emit({ name: kDatasetIdChangeEmitName, payload: datasetId })
  }
})

export default createContainerModule<State, Selector, typeof reducers, Effects>(
  'workbook/reportCanvas',
  {
    initialState,
    selectors,
    effects,
    reducers
  }
)
