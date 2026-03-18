import { handleActions } from "redux-actions";
import { INITIAL_STATE, ISecurityAlertsStateContext } from "./context";
import { SecurityAlertsActionEnums } from "./actions";

export const SecurityAlertsReducer = handleActions<
  ISecurityAlertsStateContext,
  Partial<ISecurityAlertsStateContext>
>(
  {
    [SecurityAlertsActionEnums.setState]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [SecurityAlertsActionEnums.setFilters]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [SecurityAlertsActionEnums.setAppliedFilters]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [SecurityAlertsActionEnums.setPagination]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [SecurityAlertsActionEnums.resetState]: (_, action) => ({
      ...INITIAL_STATE,
      ...action.payload,
    }),
  },
  INITIAL_STATE,
);
