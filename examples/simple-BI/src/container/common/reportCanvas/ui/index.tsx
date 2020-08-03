import React, { FC, useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "@alipay/kop";
import Chart from "./components/chart";
import { Chart as ChartType } from "../../../../domain/chart";
import module from "../index";
import LoadingIcon from "../../../../common/component/LoadingIcon";
import "./index.css";

interface Props {
  reportId: string;
}

const ReportCanvas: FC<Props> = (props) => {
  const dispatch = useDispatch();
  const charts: ChartType[] = useSelector((state) => {
    return module.selectors.getCharts(state, props.reportId);
  });
  const selectedChartId = useSelector(module.selectors.getSelectedChartId);
  const loading = useSelector(module.selectors.getLoading);

  const changeSelectedChart = useCallback((id: string) => {
    dispatch(module.actions.setSelectedChart(id));
  }, []);

  const chartList = charts.map((chart: ChartType, index: number) => {
    return (
      <Chart
        chart={chart}
        key={chart.id}
        selectedChartId={selectedChartId}
        changeSelectedChart={changeSelectedChart}
      />
    );
  });

  return (
    <div className="report-canvas">
      {loading ? (
        <LoadingIcon />
      ) : chartList.length ? (
        <div className="list">{chartList}</div>
      ) : null}
    </div>
  );
};

export default ReportCanvas;
