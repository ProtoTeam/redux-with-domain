import { DATASET_LIST } from "../common/mock";

export async function quertyDatasetList(idList: string[]) {
    const list = DATASET_LIST.filter(dataset => idList.includes(dataset.id));
    // 模拟等待1秒钟
    await new Promise((resolve) => {
        setTimeout(resolve, 1000);
    });
    return list;
}