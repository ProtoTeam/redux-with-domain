import { createDomainModule } from 'redux-with-domain'
import { quertyReportList } from '../api/report'

export interface ReportItem {
  id: string // 报表id
  name: string // 报表名称
  workbookId: string // 所属工作簿
}

interface Entities {
  reportList: ReportItem
}

interface Effects {
  fetchReports: (data: { payload: string[] }) => any
}

export default createDomainModule<Entities, {}, Effects>('domain/report', {
  entities: {
    reportList: 'id'
  },
  selectors: {}, // 占位
  services: ({ services, entities, sagaEffects: { put, call } }) => ({
    *fetchReports({ payload }: { payload: string[] }) {
      // 请求报表列表
      const reports:ReportItem = yield call(quertyReportList, payload)
      // 保存值
      entities.reportList.insert(reports)
    }
  })
})
