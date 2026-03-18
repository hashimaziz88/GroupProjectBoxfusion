import { handleActions } from "redux-actions";
import { IAdminStateContext, INITIAL_STATE } from "./context";
import { AdminActionEnums } from "./actions";

export const AdminReducer = handleActions<
  IAdminStateContext,
  Partial<IAdminStateContext>
>(
  {
    [AdminActionEnums.setState]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [AdminActionEnums.resetState]: (_, action) => ({
      ...INITIAL_STATE,
      ...action.payload,
    }),
  },
  INITIAL_STATE,
);
