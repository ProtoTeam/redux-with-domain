import { createPageModule } from 'redux-with-domain'
import _ from 'lodash'
import AttributesModule from '../../container/workbook/chartAttribute'
import DatasetFieldsModule from '../../container/workbook/datasetField'
import DatasetListModule, {
  kSelectedDatasetIdChangeEmitName
} from '../../container/workbook/datasetList'
import ReportCanvasModule, {
  kDatasetIdChangeEmitName
} from '../../container/common/reportCanvas'
import ReportListModule, {
  kSelectedReportIdChangeEmitName
} from '../../container/workbook/reportList'
import workbookDomain from '../../domain/workbook'
import reportDomain, { ReportItem } from '../../domain/report'
import loadWorkbook from '../../service/loadWorkbook'

// 工作簿页面 module
export default createPageModule('workbook', {
  initialState: {
    workbookId: '',
    selectedReportId: ''
  },
  selectors: {
    getWorkbookName: state => {
      const workbook = workbookDomain.entities.workbookList.get(
        state.workbookId
      )
      return workbook ? workbook.name : ''
    },
    getSelectedDatasetId: state => {
      return DatasetListModule.selectors.getSelectedDatasetId(state)
    },
    getSelectedReportId: state => {
      return state.selectedReportId
    },
    getSelectedChartId: state => {
      return ReportCanvasModule.selectors.getSelectedChartId(state)
    }
  },
  reducers: {
    saveWorkbookId: (state, { payload }: { payload: string }) => {
      return {
        ...state,
        workbookId: payload
      }
    },
    saveSelectedReportId: (state, { payload }: { payload: string }) => {
      return {
        ...state,
        selectedReportId: payload
      }
    }
  },
  injectModules: [
    AttributesModule,
    DatasetFieldsModule,
    DatasetListModule,
    ReportCanvasModule,
    ReportListModule
  ],
  effects: ({
    actions,
    selectors,
    sagaEffects: { call, put },
    enhancer: { syncPut }
  }) => ({
    *init({ payload: workbookId }: { payload: string }) {
      // 保存当前工作簿id
      yield syncPut(actions.saveWorkbookId(workbookId))
      // 通过service完成数据初使化
      yield call(loadWorkbook, workbookId)
      // 初始化列表显示
      yield syncPut(ReportListModule.actions.init())
      // 初始化数据集
      yield syncPut(DatasetListModule.actions.init())
    },
    *setSelectedReport({ payload: reportId }: { payload: string }) {
      // 保存当前选中报表id
      yield syncPut(actions.saveSelectedReportId(reportId))
      // 清空选中的图表
      yield syncPut(ReportCanvasModule.actions.saveSelectedChartId(''))
      // 刷新图表视图
      yield put(ReportCanvasModule.actions.reloadChart(reportId))
    }
  }),
  watchers: ({ actions, sagaEffects: { put }, enhancer: { syncPut } }) => {
    return {
      // 选中数据集id改变
      *[DatasetListModule.event(kSelectedDatasetIdChangeEmitName)]({}) {
        // 清空图表选中
        yield put(ReportCanvasModule.actions.saveSelectedChartId(''))
      },
      // 图表使用的数据集改变
      *[ReportCanvasModule.event(kDatasetIdChangeEmitName)]({
        payload
      }: {
        payload: string
      }) {
        // 选中数据集
        yield put(DatasetListModule.actions.saveSelectedDataset(payload))
      },
      // 选中报表id改变
      *[ReportListModule.event(kSelectedReportIdChangeEmitName)]({
        payload
      }: {
        payload: string
      }) {
        // 设置报表id
        yield syncPut(actions.setSelectedReport(payload))
      }
    }
  }
})
