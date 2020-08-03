import { effects } from 'redux-with-domain'
import { queryWorkbook } from '../api/workbook'
import { quertyDatasetList } from '../api/dataset'
import { quertyReportList } from '../api/report'
import workbookDomain from '../domain/workbook'
import datasetDomain from '../domain/dataset'
import reportDomain from '../domain/report'

export default function* loadWorkbook(id: string) {
  // 查询工作簿
  const workbook = yield effects.call(queryWorkbook, id)
  workbookDomain.entities.workbookList.insert(workbook)
  // 查询引用的数据集
  const datasetList = yield effects.call(
    quertyDatasetList,
    workbook.datasetIdList
  )
  datasetDomain.entities.datasetList.insert(datasetList)
  // 查询管理的报表
  const reportList = yield effects.call(quertyReportList, workbook.reportIdList)
  reportDomain.entities.reportList.insert(reportList)
}
