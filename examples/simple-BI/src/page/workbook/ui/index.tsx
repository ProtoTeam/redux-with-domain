import React, { FC, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "@alipay/kop";
import { DndProvider } from "react-dnd";
import Backend from "react-dnd-html5-backend";
import _ from "lodash";
import PageModule from "../index";
import "./index.css";

import Attribute from "../../../container/workbook/chartAttribute/ui";
import DatasetFields from "../../../container/workbook/datasetField/ui";
import DatasetList from "../../../container/workbook/datasetList/ui";
import ReportCanvas from "../../../container/common/reportCanvas/ui";
import ReportList from "../../../container/workbook/reportList/ui";

interface Props {}

const Workbook: FC<Props> = (props) => {
  const dispatch = useDispatch();
  const id: string = _.get(props, "match.params.id");
  // 触发初使化
  useEffect(() => {
    dispatch(PageModule.actions.init(id));
  }, [id]);

  // 获取工作簿名称
  const name = useSelector((state: object) => {
    return PageModule.selectors.getWorkbookName(state);
  });

  // 当前选中的报表
  const reportId = useSelector((state) => {
    return PageModule.selectors.getSelectedReportId(state);
  });

  // 打开预览
  const onPreview = useCallback(() => {
    window.open(`${window.location.origin}/report/${reportId}`);
  }, [reportId]);

  return (
    <DndProvider backend={Backend}>
      <div className="workbook">
        <div className="header">
          <span>{`KOP Demo:${name}`}</span>
          <button onClick={onPreview}>预览</button>
        </div>
        <div className="content">
          <div className="sidebar">
            <div className="sidebar-header">数据</div>
            <div className="sidebar-main">
              <div className="left">
                <DatasetList />
                <DatasetFields />
              </div>
              <div className="right">
                <Attribute />
              </div>
            </div>
          </div>
          <div className="main-container">
            <ReportCanvas reportId={reportId} />
            <ReportList />
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default Workbook;
