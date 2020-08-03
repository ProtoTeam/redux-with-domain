import React, { FC, useCallback, ChangeEvent } from 'react'
import { useSelector, useDispatch } from 'redux-with-domain'
import { Input } from 'antd'
import FieldItem from './components/fieldItem'
import module from '../index'
import './index.css'

interface Props {}

const DatasetField: FC<Props> = props => {
  const fields = useSelector((state: any) =>
    module.selectors.getDatasetFields(state)
  )

  const dispatch = useDispatch()
  const onSearch = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      dispatch(module.actions.updateFilter(event.target.value))
    },
    [module, dispatch]
  )

  return (
    <div className="dataset-field">
      <div className="title">数据集字段</div>
      <div className="list">
        <Input
          className="search"
          size="small"
          placeholder="搜索字段"
          onChange={onSearch}
        />
        {fields.map((field, index: number) => {
          return <FieldItem field={field} key={field.id} />
        })}
      </div>
    </div>
  )
}

export default DatasetField
