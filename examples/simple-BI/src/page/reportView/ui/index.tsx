import React, { FC, useEffect } from 'react'
import _ from 'lodash'
import { useDispatch } from 'redux-with-domain'
import ReportCanvas from '../../../container/common/reportCanvas/ui'
import module from '../index'
import './index.css'

interface Props {}

const Report: FC<Props> = props => {
  const id: string = _.get(props, 'match.params.id')
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(module.actions.init(id))
  }, [dispatch, id])

  return (
    <div className="main-content">
      <ReportCanvas reportId={id} />
    </div>
  )
}

export default Report
