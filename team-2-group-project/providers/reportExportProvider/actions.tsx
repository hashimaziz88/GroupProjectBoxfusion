import { createAction } from "redux-actions";
import { IReportExportStateContext, INITIAL_STATE } from "./context";

export enum ReportExportActionEnums {
  setState = "REPORT_EXPORT_SET_STATE",
  resetState = "REPORT_EXPORT_RESET_STATE",
}

export const setReportExportState = createAction<
  Partial<IReportExportStateContext>,
  Partial<IReportExportStateContext>
>(ReportExportActionEnums.setState, (payload) => payload);

export const resetReportExportState = createAction<
  IReportExportStateContext,
  Partial<IReportExportStateContext> | undefined
>(
  ReportExportActionEnums.resetState,
  (payload) => ({
    ...INITIAL_STATE,
    ...payload,
  }),
);
