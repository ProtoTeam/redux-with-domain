import ReactDOM from "react-dom";
import createApp from "@alipay/kop";
import "./index.css";
import AppRouter from "./router";

import workbookDomain from "./domain/workbook";
import datasetDomain from "./domain/dataset";
import reportDomain from "./domain/report";
import chartDomain from "./domain/chart";
import WorkbookModule from "./page/workbook";
import AttributesModule from "./container/workbook/chartAttribute";
import DatasetFieldsModule from "./container/workbook/datasetField";
import DatasetListModule from "./container/workbook/datasetList";
import ReportCanvasModule from "./container/common/reportCanvas";
import ReportListModule from "./container/workbook/reportList";

import ReportPageModule from "./page/reportView";

const app = createApp();

app.addPage(WorkbookModule, {
  containers: [
    AttributesModule,
    DatasetFieldsModule,
    DatasetListModule,
    ReportCanvasModule,
    ReportListModule,
  ],
});

app.addPage(ReportPageModule, {
  container: [ReportCanvasModule],
});

app.addDomain(workbookDomain);
app.addDomain(datasetDomain);
app.addDomain(reportDomain);
app.addDomain(chartDomain);

app.addRouter(AppRouter);

const node = app.start();

ReactDOM.render(node as any, document.getElementById("root"));
