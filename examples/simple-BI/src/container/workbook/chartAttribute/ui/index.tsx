import React, { FC } from "react";
import { useSelector } from "@alipay/kop";
import AttriItem from "./components/attrItem";
import module from "../index";
import "./index.css";

interface Props {}

const ChartAttribute: FC<Props> = props => {
  const attrs =
    useSelector((state: any) => module.selectors.getAttribute(state)) || [];

  const attrItems = attrs.map((attr, index) => {
    const { group } = attr;

    return <AttriItem key={group} attr={attr} index={index}/>;
  });

  return (
    <div className="chart-attr">
      {attrItems.length ? (
        attrItems
      ) : (
        <div className="attr-empty">图表数据配置区</div>
      )}
    </div>
  );
};

export default ChartAttribute;
