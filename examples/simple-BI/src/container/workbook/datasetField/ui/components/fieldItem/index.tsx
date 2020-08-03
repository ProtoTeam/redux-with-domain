import React, { FC } from 'react'
import { useDrag } from 'react-dnd'
import FieldIcon from '../../../../../../common/component/FieldIcon'

// import "./index.css";

interface Props {
  field: {
    id: string
    name: string
  }
}

const FieldItem: FC<Props> = props => {
  const { field } = props

  const [_, dragRef] = useDrag({
    item: { type: 'FIELD', id: field.id }
  })

  return (
    <div className="item" ref={dragRef}>
      <FieldIcon />
      <span>{field.name}</span>
    </div>
  )
}

export default FieldItem
