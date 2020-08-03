import { WORK_BOOK } from "../common/mock";

export async function queryWorkbook(wbId: string) {
    const workbook = WORK_BOOK;
    // 模拟等待3秒钟
    await new Promise((resolve) => {
        setTimeout(resolve, 1000);
    });
    return workbook;
}