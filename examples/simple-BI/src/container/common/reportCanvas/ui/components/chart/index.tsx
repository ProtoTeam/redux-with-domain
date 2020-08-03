import React, { FC, useState, useEffect, useRef } from "react";
import _ from "lodash";
import { Pie, Line, Bar, Column } from "@antv/g2plot";

import { queryData as query } from "../../../../../../api/chart";
import { Chart as ChartType } from "../../../../../../domain/chart";

interface Props {
  chart: ChartType;
  selectedChartId?: string;
  changeSelectedChart?: Function;
}

const aggregate = (data: any, key: string, value: string) => {
  // 对 value 进行聚合，默认 count
  const countData: any = {};
  data.forEach((item: any) => {
    if (countData[item[key]]) {
      countData[item[key]] = countData[item[key]] + item[value];
    } else {
      countData[item[key]] = item[value];
    }
  });
  return Object.keys(countData).map((k: string) => {
    return {
      [key]: k,
      [value]: countData[k]
    };
  });
};

const renderer: Record<string, Record<string, Function>> = {
  pie: {
    render: (id: string, data: any, chart: any) => {
      const key = chart.attribute[0].fields[0];
      const value = chart.attribute[1].fields[0];
      const keyName = chart.attribute[0].fieldsName[0];
      const valName = chart.attribute[1].fieldsName[0];

      const piePlot = new Pie(document.getElementById(id)!, {
        forceFit: true,
        radius: 0.8,
        data,
        angleField: value,
        colorField: key,
        meta: {
          [key]: {
            alias: keyName
          },
          [value]: {
            alias: valName
          }
        },
        label: {
          visible: true,
          type: "inner"
        }
      });
      piePlot.render();
      return piePlot;
    },
    update: (instance: any, data: any, chart: any) => {
      instance.updateConfig({
        data,
        angleField: chart.attribute[1].fields[0],
        colorField: chart.attribute[0].fields[0]
      });
      instance.render();
    }
  },
  line: {
    render: (id: string, data: any, chart: any) => {
      const key = chart.attribute[0].fields[0];
      const value = chart.attribute[1].fields[0];
      const keyName = chart.attribute[0].fieldsName[0];
      const valName = chart.attribute[1].fieldsName[0];

      const linePlot = new Line(document.getElementById(id)!, {
        data: aggregate(data, key, value),
        xField: chart.attribute[0].fields[0],
        yField: chart.attribute[1].fields[0],
        meta: {
          [key]: {
            alias: keyName
          },
          [value]: {
            alias: valName
          }
        },
      });
      linePlot.render();
      return linePlot;
    },
    update: (instance: any, data: any, chart: any) => {
      const key = chart.attribute[0].fields[0];
      const value = chart.attribute[1].fields[0];

      instance.updateConfig({
        data: aggregate(data, key, value),
        xField: key,
        yField: value
      });
      instance.render();
    }
  },
  bar: {
    render: (id: string, data: any, chart: any) => {
      const key = chart.attribute[0].fields[0];
      const value = chart.attribute[1].fields[0];
      const keyName = chart.attribute[0].fieldsName[0];
      const valName = chart.attribute[1].fieldsName[0];

      const barPlot = new Column(document.getElementById(id)!, {
        forceFit: true,
        data: aggregate(data, key, value),
        xField: key,
        yField: value,
        padding: 'auto',
        meta: {
          [key]: {
            alias: keyName
          },
          [value]: {
            alias: valName
          }
        },
        label: {
          visible: true
        }
      });
      barPlot.render();
      return barPlot;
    },
    update: (instance: any, data: any, chart: any) => {
      const key = chart.attribute[0].fields[0];
      const value = chart.attribute[1].fields[0];

      instance.updateConfig({
        data: aggregate(data, key, value),
        xField: key,
        yField: value
      });
      instance.render();
    }
  }
};

const validateField: Record<string, Function> = {
  pie: (chart: ChartType) => {
    const attribute = chart.attribute;
    if (attribute.length === 2) {
      if (attribute[0].fields.length > 0 && attribute[1].fields.length > 0) {
        return true;
      }
    }
    return false;
  },
  line: (chart: ChartType) => {
    const attribute = chart.attribute;
    if (attribute.length === 2) {
      if (attribute[0].fields.length > 0 && attribute[1].fields.length > 0) {
        return true;
      }
    }
    return false;
  },
  bar: (chart: ChartType) => {
    const attribute = chart.attribute;
    if (attribute.length === 2) {
      if (attribute[0].fields.length > 0 && attribute[1].fields.length > 0) {
        return true;
      }
    }
    return false;
  }
};

const Chart: FC<Props> = ({ chart, changeSelectedChart, selectedChartId }) => {
  const [type, setType] = useState("");
  const g2plot = useRef<any>(null);

  const id = `chart-container-${chart.id}`;

  const queryData = () => {
    if (validateField[chart.type](chart)) {
      query(
        chart.datasetId,
        _.flatten(
          Object.values(chart.attribute).map(item => {
            return item.fields;
          })
        )
      ).then(res => {
        if (!g2plot.current) {
          g2plot.current = renderer[chart.type].render(id, res, chart);
          setType(chart.type);
        } else {
          renderer[chart.type].update(g2plot.current, res, chart);
        }
      });
    }
  };

  useEffect(() => {
    // shouldQueryData
    queryData();
  }, [chart]);
  
  return (
    <div
      className={
        selectedChartId === String(chart.id) ? "selected chart" : "chart"
      }
      onClick={() => {
        changeSelectedChart && changeSelectedChart(chart.id);
      }}
    >
      <div className="title">{chart.name}</div>
      <div id={id} className="chart-container"></div>
    </div>
  );
};

export default Chart;
