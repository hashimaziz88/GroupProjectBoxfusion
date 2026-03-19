import { handleActions } from "redux-actions";
import { ReportExportActionEnums } from "./actions";
import { IReportExportStateContext, INITIAL_STATE } from "./context";

export const ReportExportReducer = handleActions<
  IReportExportStateContext,
  Partial<IReportExportStateContext>
>(
  {
    [ReportExportActionEnums.setState]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ReportExportActionEnums.resetState]: (_, action) => ({
      ...INITIAL_STATE,
      ...action.payload,
    }),
  },
  INITIAL_STATE,
);
