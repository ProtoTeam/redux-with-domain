import { createPageModule } from "@alipay/kop";
import reportDomain from '../../domain/report';
import ReportCanvasModule from "../../container/common/reportCanvas";

export default createPageModule('report', {
    initialState: {
        reportId: '',
    },
    reducers: {
        saveReportId: (state, { payload }: { payload: string }) => {
            return {
                ...state,
                reportId: payload,
            };
        },
    },
    effects: ({ actions, sagaEffects: { call, put }, enhancer: { syncPut } }) => ({
        *init({ payload: id }: { payload: string }) {
            // 保存当前工作簿id
            yield syncPut(actions.saveReportId(id));
            // 查询报表
            yield syncPut(reportDomain.services.fetchReports([id]));
            // 初使化图表视图
            yield syncPut(ReportCanvasModule.actions.reloadChart(id));
        }
    }),
});