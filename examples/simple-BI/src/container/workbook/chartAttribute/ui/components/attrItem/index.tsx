import React, { FC } from "react";
import { useDrop } from "react-dnd";
import { useDispatch, useSelector } from "@alipay/kop";
import module, { Attrbute } from "../../../index";

interface Props {
  attr: Attrbute;
  index: number;
}

const AttriItem: FC<Props> = ({ attr: { group, fields }, index }) => {
  const dispatch = useDispatch();
  const chartId = useSelector(module.selectors.getChartId);
  const fieldItems = fields.map(field => {
    return (
      <div key={field.id} className="attr-field">
        {field.name}
      </div>
    );
  });

  const [_, drop] = useDrop({
    accept: "FIELD",
    drop: (item: any, monitor) => {
      dispatch(
        module.actions.addField({ group, fieldId: item.id, index, chartId })
      );
    }
  });

  return (
    <div key={group} className="attr">
      <div className="attr-group">{group}</div>
      <div className="attr-field-list" ref={drop}>
        {fieldItems}
      </div>
    </div>
  );
};

export default AttriItem;
