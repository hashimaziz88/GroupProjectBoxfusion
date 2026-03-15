import { handleActions } from "redux-actions";
import { AuthActionEnums } from "./actions";
import { IAuthStateContext, INITIAL_STATE } from "./context";

export const AuthReducer = handleActions<
  IAuthStateContext,
  Partial<IAuthStateContext>
>(
  {
    [AuthActionEnums.initializeComplete]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [AuthActionEnums.loginPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [AuthActionEnums.loginSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [AuthActionEnums.loginError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [AuthActionEnums.registerPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [AuthActionEnums.registerSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [AuthActionEnums.registerError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [AuthActionEnums.logoutPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [AuthActionEnums.logoutError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [AuthActionEnums.logoutSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [AuthActionEnums.getMePending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [AuthActionEnums.getMeSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [AuthActionEnums.getMeError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [AuthActionEnums.tenantContextUpdated]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [AuthActionEnums.tenantContextCleared]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  INITIAL_STATE,
);
