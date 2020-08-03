import { createContainerModule } from "@alipay/kop";
import reportDomain, { ReportItem } from "../../../domain/report";

// 向页面抛出选中报表id改变的事件名
export const kSelectedReportIdChangeEmitName = 'setSelectedReportId';

export default createContainerModule('workbook/reportList', {
    initialState: {},
    selectors: {
        getReports: (state) => {
            const list: ReportItem[] = reportDomain.entities.reportList.select() || [];
            return list;
        },
        getSelectedReportId: (state, { pageSelectors } = {}) => {
            return pageSelectors.getSelectedReportId();
        },
    },
    effects: ({
        actions,
        selectors,
        sagaEffects: { call, put, select },
        enhancer: { emit, syncPut }
    }) => ({
        *init() {
            // 选中第一条报表
            const reportList: ReportItem[] = yield select(selectors.getReports);
            if (reportList && reportList.length > 0) {
                yield syncPut(actions.setSelectedReportId(reportList[0].id));
            }
        },
        *setSelectedReportId({ payload }: { payload: string }) {
            // 告知页面报表选中已经发生变化
            yield emit({ name: kSelectedReportIdChangeEmitName, payload: payload });
        },
    }),
});