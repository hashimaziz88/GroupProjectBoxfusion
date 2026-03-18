import { createAction } from "redux-actions";
import { IAdminStateContext, INITIAL_STATE } from "./context";

export enum AdminActionEnums {
  setState = "ADMIN_SET_STATE",
  resetState = "ADMIN_RESET_STATE",
}

export const setAdminState = createAction<
  Partial<IAdminStateContext>,
  Partial<IAdminStateContext>
>(AdminActionEnums.setState, (payload) => payload);

export const resetAdminState = createAction<
  IAdminStateContext,
  Partial<IAdminStateContext> | undefined
>(AdminActionEnums.resetState, (payload) => ({
  ...INITIAL_STATE,
  ...payload,
}));
