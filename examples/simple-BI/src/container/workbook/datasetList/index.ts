import { createContainerModule } from 'redux-with-domain'
import update from 'immutability-helper-x'
import _ from 'lodash'
import datasetDomain, { DatasetItem } from '../../../domain/dataset'
import chartDomain from '../../../domain/chart'

// 向页面数据集改变的事件名
export const kSelectedDatasetIdChangeEmitName = 'setSelectedDatasetId'

/**
 * {page-module}
 */
export default createContainerModule('workbook/datasetList', {
  initialState: {
    selectedDatasetId: ''
  },
  selectors: {
    getDatasetList: (state: any, { payload: id }: { payload: string }) => {
      return datasetDomain.entities.datasetList.select()
    },
    getSelectedDatasetId: state => state.selectedDatasetId,
    getSelectedChartId: (state, { pageSelectors }) => {
      const id = pageSelectors.getSelectedChartId()
      return id
    }
  },
  reducers: {
    saveSelectedDataset: (state, { payload }: { payload: string }) => {
      return update.$set(state, 'selectedDatasetId', payload)
    }
  },
  effects: ({
    actions,
    selectors,
    sagaEffects: { put, select, call },
    enhancer: { emit, syncPut }
  }) => ({
    *init() {
      // 选中第一个数据集
      const datasetList: DatasetItem[] = yield select(
        selectors.getDatasetList as any
      )
      if (datasetList && datasetList.length > 0) {
        yield syncPut(actions.saveSelectedDataset(datasetList[0].id))
      }
    },
    *setSelectedDataset({ payload }: { payload: string }) {
      yield put(actions.saveSelectedDataset(payload))
      const chartId: string = yield select(selectors.getSelectedChartId as any) // pageSelectors 的类型问题
      if (chartId) {
        // 判断是否对应，不对应的话，清理图表选中
        const chart = chartDomain.entities.chart.get(chartId)
        if (chart.datasetId !== payload) {
          yield emit({ name: kSelectedDatasetIdChangeEmitName, payload })
        }
      }
    }
  })
})
