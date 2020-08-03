import { REPORT_LIST, REPORT_CHART_INFO } from "../common/mock";

// 查询报表列表
export async function quertyReportList(idList: string[]) {
    const list = REPORT_LIST.filter(report => idList.includes(report.id));
    // 模拟等待1秒钟
    await new Promise((resolve) => {
        setTimeout(resolve, 1000);
    });
    return list;
}

// 查询报表详情
export async function quertyReportChartInfo(reportId: string) {
    const chartInfo = REPORT_CHART_INFO as { [key: string]: object[] }
    // 模拟等待1秒钟
    await new Promise((resolve) => {
        setTimeout(resolve, 1000);
    });
    return chartInfo[reportId] || {};
}