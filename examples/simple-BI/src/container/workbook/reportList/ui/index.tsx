import React, { FC, useCallback } from 'react'
import { useSelector, useDispatch } from 'redux-with-domain'
import module from '../index'
import './index.css'

interface Props {}
const ReportList: FC<Props> = props => {
  // 报表列表
  const reports = useSelector(state => {
    return module.selectors.getReports(state)
  })
  // 选中的报表
  const selectedReportId = useSelector(state => {
    return module.selectors.getSelectedReportId(state)
  })
  // 选中变更
  const dispatch = useDispatch()
  const changeSelectedReport = useCallback(
    (id: string) => {
      dispatch(module.actions.setSelectedReportId(id))
    },
    [dispatch]
  )

  return (
    <div className="reports">
      {reports.map((report, index: number) => {
        return (
          <div
            key={index}
            className={
              report.id === selectedReportId ? 'selected item' : 'item'
            }
            onClick={() => {
              changeSelectedReport(report.id)
            }}
          >
            {report.name}
          </div>
        )
      })}
    </div>
  )
}

export default ReportList
