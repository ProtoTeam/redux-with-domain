import { createContainerModule } from "@alipay/kop";
import _ from "lodash";
import chartDomain, { Attr } from "../../../domain/chart";
import datasetDomain, { DatasetItem, Field } from "../../../domain/dataset";

export interface Attrbute {
  max?: number;
  group: string;
  fields: Field[];
}

/**
 * {page-module}
 */
export default createContainerModule("workbook/attributes", {
  initialState: {},
  selectors: {
    getChartId: (state, { pageSelectors } = {}): string => {
      return pageSelectors.getSelectedChartId();
    },
    getAttribute: (state, { pageSelectors } = {}): Attrbute[] => {
      const chartId: string = pageSelectors.getSelectedChartId();
      const chart = chartDomain.entities.chart.get(chartId);
      let attributes: Attr[] | undefined = _.get(chart, "attribute");
      if (attributes && attributes.length > 0) {
        // 找到对应的数据集
        const dataset: DatasetItem = datasetDomain.entities.datasetList.get(chart.datasetId);
        return attributes.map(item => {
          const chartFields = item.fields as string[];
          const fields = !dataset ? [] : dataset.fields.filter(field => chartFields.includes(field.id));
          return {
            ...item,
            fields,
          };
        });
      }
      return [];
    }
  },
  reducers: {},
  effects: ({
    actions,
    selectors,
    sagaEffects: { put, select, call },
    enhancer: { emit, syncPut }
  }) => ({
    // eslint-disable-next-line require-yield
    *addField({
      payload
    }: {
      payload: {
        group: string;
        fieldId: string;
        index: number;
        chartId: string;
      };
    }) {
      const { chartId, index, fieldId } = payload;
      console.log(payload);
      const chart = chartDomain.entities.chart.get(chartId);
      let newAttr: Attr[] = chart.attribute;
      newAttr = newAttr.map((item, idx) => {
        if (index === idx) {
          let arr = _.uniq([...item.fields, fieldId]);
          if (item.max && arr.length > item.max) {
            arr = arr.slice(arr.length - 1 - item.max + 1, arr.length - 1 + 1);
          }
          console.log(arr)
          return {
            ...item,
            fields: arr
          };
        }
        return item;
      });

      chartDomain.entities.chart.update({
        ...chart,
        attribute: newAttr
      });
      console.log({
        ...chart,
        attribute: newAttr
      });
    }
  })
});
