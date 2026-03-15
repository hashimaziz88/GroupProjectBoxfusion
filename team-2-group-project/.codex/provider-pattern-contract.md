# Provider Pattern Contract (Strict)

## Purpose

This file defines the exact provider setup style required in this frontend.

## Required Structure for Every Provider

```text
providers/<feature>Provider/
  actions.tsx
  context.tsx
  index.tsx
  reducer.tsx
```

This structure is mandatory. Do not deviate.

## Canonical Example (Auth Provider)

### `actions.tsx`

```tsx
import { createAction } from "redux-actions";
import { IAuthStateContext, IUserLoginResponse } from "./context";

export enum AuthActionEnums {
    loginPending = "LOGIN_PENDING",
    loginSuccess = "LOGIN_SUCCESS",
    loginError = "LOGIN_ERROR",

    registerPending = "REGISTER_PENDING",
    registerSuccess = "REGISTER_SUCCESS",
    registerError = "REGISTER_ERROR",

    logoutPending = "LOGOUT_PENDING",
    logoutError = "LOGOUT_ERROR",
    logoutSuccess = "LOGOUT_SUCCESS",

    getMePending = "GET_ME_PENDING",
    getMeSuccess = "GET_ME_SUCCESS",
    getMeError = "GET_ME_ERROR",
}

export const loginPending = createAction<IAuthStateContext>(
    AuthActionEnums.loginPending,
    () => ({ isPending: true, isError: false, isSuccess: false, isAuthenticated: false })
);

export const loginSuccess = createAction<IAuthStateContext, IUserLoginResponse>(
    AuthActionEnums.loginSuccess,
    (user: IUserLoginResponse) => ({ isPending: false, isError: false, isSuccess: true, user, isAuthenticated: true })
);

export const loginError = createAction<IAuthStateContext>(
    AuthActionEnums.loginError,
    () => ({ isPending: false, isError: true, user: null, isSuccess: false, isAuthenticated: false })
);

export const registerPending = createAction<IAuthStateContext>(
    AuthActionEnums.registerPending,
    () => ({ isPending: true, isError: false, isSuccess: false, isAuthenticated: false })
);

export const registerSuccess = createAction<IAuthStateContext, IUserLoginResponse>(
    AuthActionEnums.registerSuccess,
    (user: IUserLoginResponse) => ({ isPending: false, isError: false, isSuccess: true, user, isAuthenticated: true })
);

export const registerError = createAction<IAuthStateContext>(
    AuthActionEnums.registerError,
    () => ({ isPending: false, isError: true, user: null, isSuccess: false, isAuthenticated: false })
);

export const logoutPending = createAction<IAuthStateContext>(
    AuthActionEnums.logoutPending,
    () => ({ isPending: true, isError: false, isSuccess: false, isAuthenticated: false })
);

export const logoutError = createAction<IAuthStateContext>(
    AuthActionEnums.logoutError,
    () => ({ isPending: false, isError: true, isSuccess: false, user: null, isAuthenticated: false })
);

export const logoutSuccess = createAction<IAuthStateContext>(
    AuthActionEnums.logoutSuccess,
    () => ({ isSuccess: false, isPending: false, isError: false, user: null, isAuthenticated: false })
);

export const getMePending = createAction<IAuthStateContext>(
    AuthActionEnums.getMePending,
    () => ({ isPending: true, isError: false, isSuccess: false, isAuthenticated: false })
);

export const getMeSuccess = createAction<IAuthStateContext, IUserLoginResponse>(
    AuthActionEnums.getMeSuccess,
    (user: IUserLoginResponse) => ({ isPending: false, isError: false, isSuccess: true, user, isAuthenticated: true })
);

export const getMeError = createAction<IAuthStateContext>(
    AuthActionEnums.getMeError,
    () => ({ isPending: false, isError: true, isSuccess: false, user: null, isAuthenticated: false })
);
```

### `context.tsx`

```tsx
import { createContext } from "react";

export interface IUserLoginRequest {
    email?: string | null;
    password?: string | null;
}

export interface IUserRegisterRequest {
    email?: string | null;
    password?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    phoneNumber?: string | null;
    tenantName?: string | null;
    tenantId?: string | null;
    role?: string | null;
}

export interface IUserLoginResponse {
    token?: string | null;
    userId?: string;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    roles?: string[] | null;
    tenantId?: string | null;
    expiresAt?: string;
}

export interface IAuthStateContext {
    isSuccess: boolean;
    isPending: boolean;
    isError: boolean;
    isAuthenticated: boolean;
    user?: IUserLoginResponse | null;
}

export interface IAuthActionContext {
    login: (payload: IUserLoginRequest) => Promise<void>;
    register: (payload: IUserRegisterRequest) => Promise<void>;
    logout: () => Promise<void>;
    getMe: () => Promise<void>;
}

export const INITIAL_STATE: IAuthStateContext = {
    isSuccess: false,
    isPending: false,
    isError: false,
    isAuthenticated: false,
    user: null,
};

export const AuthStateContext = createContext<IAuthStateContext>(INITIAL_STATE);

export const AuthActionContext = createContext<IAuthActionContext>(undefined!);
```

### `index.tsx`

```tsx
"use client";
import React, { useReducer, useContext, useEffect } from "react";
import { INITIAL_STATE, AuthActionContext, AuthStateContext, IUserLoginRequest, IUserRegisterRequest } from "./context";
import { AuthReducer } from "./reducer";
import {
    loginPending, loginSuccess, loginError,
    registerPending, registerSuccess, registerError,
    logoutPending, logoutSuccess, logoutError,
    getMePending, getMeSuccess, getMeError
} from "./actions";
import { axiosInstance } from "@/utils/axiosInstance";
import { useRouter } from "next/navigation";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);
    const router = useRouter();

    const login = async (payload: IUserLoginRequest) => {
        dispatch(loginPending());
        await axiosInstance().post("/api/Auth/login", payload)
            .then((response) => {
                dispatch(loginSuccess(response.data));
                sessionStorage.setItem("token", response.data.token);
                router.push("/dashboard");
            })
            .catch((error) => {
                dispatch(loginError());
                console.error(error.message);
            });
    };

    const register = async (payload: IUserRegisterRequest) => {
        dispatch(registerPending());
        await axiosInstance().post("/api/Auth/register", payload)
            .then((response) => {
                dispatch(registerSuccess(response.data));
                sessionStorage.setItem("token", response.data.token);
                router.push("/dashboard");
            })
            .catch((error) => {
                console.error(error);
                dispatch(registerError());
            });
    };

    const logout = async () => {
        dispatch(logoutPending());
        await Promise.resolve()
            .then(() => {
                sessionStorage.removeItem("token");
                dispatch(logoutSuccess());
            })
            .catch((error) => {
                console.error("Logout error:", error);
                dispatch(logoutError());
            });
    };

    const getMe = async () => {
        const token = sessionStorage.getItem("token");
        if (token) {
            dispatch(getMePending());
            await axiosInstance().get("/api/Auth/me")
                .then((response) => {
                    dispatch(getMeSuccess(response.data));
                })
                .catch((error) => {
                    console.error(error);
                    sessionStorage.removeItem("token");
                    dispatch(getMeError());
                });
        }
    };

    useEffect(() => {
        getMe();
    }, []);

    return (
        <AuthStateContext.Provider value={state}>
            <AuthActionContext.Provider value={{ login, register, logout, getMe }}>
                {children}
            </AuthActionContext.Provider>
        </AuthStateContext.Provider>
    );
};

export const useAuthState = () => {
    const context = useContext(AuthStateContext);
    if (context === undefined) {
        throw new Error("useAuthState must be used within an AuthProvider");
    }
    return context;
};

export const useAuthActions = () => {
    const context = useContext(AuthActionContext);
    if (context === undefined) {
        throw new Error("useAuthActions must be used within an AuthProvider");
    }
    return context;
};
```

### `reducer.tsx`

```tsx
import { handleActions } from "redux-actions";
import { INITIAL_STATE, IAuthStateContext } from "./context";
import { AuthActionEnums } from "./actions";

export const AuthReducer = handleActions<IAuthStateContext, Partial<IAuthStateContext>>(
    {
        [AuthActionEnums.loginPending]: (state, action) => ({ ...state, ...action.payload }),
        [AuthActionEnums.loginSuccess]: (state, action) => ({ ...state, ...action.payload }),
        [AuthActionEnums.loginError]: (state, action) => ({ ...state, ...action.payload }),

        [AuthActionEnums.registerPending]: (state, action) => ({ ...state, ...action.payload }),
        [AuthActionEnums.registerSuccess]: (state, action) => ({ ...state, ...action.payload }),
        [AuthActionEnums.registerError]: (state, action) => ({ ...state, ...action.payload }),

        [AuthActionEnums.logoutPending]: (state, action) => ({ ...state, ...action.payload }),
        [AuthActionEnums.logoutError]: (state, action) => ({ ...state, ...action.payload }),
        [AuthActionEnums.logoutSuccess]: (state, action) => ({ ...state, ...action.payload }),

        [AuthActionEnums.getMePending]: (state, action) => ({ ...state, ...action.payload }),
        [AuthActionEnums.getMeSuccess]: (state, action) => ({ ...state, ...action.payload }),
        [AuthActionEnums.getMeError]: (state, action) => ({ ...state, ...action.payload }),
    },
    INITIAL_STATE,
);
```

## Required Axios Factory

```ts
import axios from "axios";

export const axiosInstance = () => {
    const token = globalThis.window !== undefined ? sessionStorage.getItem('token') : null;
    const baseURL = process.env.NEXT_PUBLIC_API_LINK;

    return axios.create({
        baseURL: baseURL,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
};
```

## Required Page/Provider Composition Style

```tsx
'use client';

import React, { useEffect } from 'react';
import { Row, Col, Typography, Button, Divider } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { DashboardProvider, useDashboardActions, useDashboardState } from '@/providers/dashboardProvider';
import { IContractDto } from '@/providers/contractProvider/context';
import { ISalesPerformanceDto } from '@/providers/dashboardProvider/context';
import { useAuthState } from '@/providers/authProvider';
import { isAdminOrManager } from '@/utils/roles';
import { toArray } from '@/utils/helpers';
import KpiCards from '@/components/dashboard/overview/KpiCards';
import ActivitiesSummaryCards from '@/components/dashboard/overview/ActivitiesSummaryCards';
import PipelineBarChart from '@/components/dashboard/overview/PipelineBarChart';
import RevenueTrendChart from '@/components/dashboard/overview/RevenueTrendChart';
import ContractsExpiringTable from '@/components/dashboard/overview/ContractsExpiringTable';
import TopPerformersTable from '@/components/dashboard/overview/TopPerformersTable';
import { useStyles } from '@/components/dashboard/overview/style/style';
import AiInsightsCard from '@/components/aiInsightsCard';

const { Title } = Typography;

const DashboardContent: React.FC = () => {
    const { user } = useAuthState();
    const canViewTopPerformers = isAdminOrManager(user?.roles);
    const {
        getDashboardOverview,
        getSalesPerformance,
        getContractsExpiring,
        getActivitiesSummary,
        getDashboardPipelineMetrics,
    } = useDashboardActions();
    const { isPending, overview, salesPerformance, contractsExpiring } = useDashboardState();
    const { styles } = useStyles();

    const fetchAll = () => {
        getDashboardOverview();
        if (canViewTopPerformers) getSalesPerformance(5);
        getContractsExpiring(30);
        getActivitiesSummary();
        getDashboardPipelineMetrics();
    };

    useEffect(() => {
        getDashboardOverview();
        if (canViewTopPerformers) getSalesPerformance(5);
        getContractsExpiring(30);
        getActivitiesSummary();
        getDashboardPipelineMetrics();
    }, [getDashboardOverview, getSalesPerformance, getContractsExpiring, getActivitiesSummary, getDashboardPipelineMetrics, canViewTopPerformers]);

    const performanceList: ISalesPerformanceDto[] = Array.isArray(salesPerformance) ? salesPerformance : [];
    const expiringList = toArray<IContractDto>(contractsExpiring as IContractDto[] | null);
    const pipelineStages = overview?.pipeline.stages ?? [];

    const dashboardContext = {
        pipelineValue: overview?.opportunities?.pipelineValue,
        winRate: overview?.opportunities?.winRate,
        totalOpportunities: overview?.opportunities?.totalCount,
        wonDeals: overview?.opportunities?.wonCount,
        upcomingActivities: overview?.activities?.upcomingCount,
        overdueActivities: overview?.activities?.overdueCount,
        activeContracts: overview?.contracts?.totalActiveCount,
        contractValue: overview?.contracts?.totalContractValue,
        expiringContracts: overview?.contracts?.expiringThisMonthCount,
        revenueThisMonth: overview?.revenue?.thisMonth,
        revenueThisQuarter: overview?.revenue?.thisQuarter,
        revenueThisYear: overview?.revenue?.thisYear,
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.pageHeader}>
                <Title level={2} className={styles.pageTitle}>Dashboard Overview</Title>
                <Button
                    icon={<ReloadOutlined spin={isPending} />}
                    onClick={fetchAll}
                    loading={isPending}
                    className={styles.refreshBtn}
                >
                    Refresh
                </Button>
            </div>

            <KpiCards overview={overview} loading={isPending} />

            <Divider className={styles.sectionDivider} />

            <div className={styles.activitiesHeader}>
                <Title level={5} className={styles.sectionSubtitle}>
                    Activities Overview
                </Title>
                <ActivitiesSummaryCards activities={overview?.activities} loading={isPending} />
            </div>

            <Divider className={styles.sectionDivider} />

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <PipelineBarChart stages={pipelineStages} loading={isPending} />
                </Col>
                <Col xs={24} lg={12}>
                    <RevenueTrendChart revenue={overview?.revenue} loading={isPending} />
                </Col>
            </Row>

            <Divider className={styles.sectionDivider} />

            <AiInsightsCard
                data={dashboardContext}
                type="dashboard"
                disabled={!overview}
            />

            <Divider className={styles.sectionDivider} />

            <Row gutter={[16, 16]}>
                {canViewTopPerformers && (
                    <Col xs={24} xl={14}>
                        <TopPerformersTable performers={performanceList} loading={isPending} />
                    </Col>
                )}
                <Col xs={24} xl={canViewTopPerformers ? 10 : 24}>
                    <ContractsExpiringTable contracts={expiringList} loading={isPending} />
                </Col>
            </Row>
        </div>
    );
};

const DashboardPage: React.FC = () => (
    <DashboardProvider>
        <DashboardContent />
    </DashboardProvider>
);

export default DashboardPage;
```

## Required `antd-style` Pattern Example

```tsx
import { createStyles, css } from "antd-style";

export const useStyles = createStyles(({ token }) => ({
  container: css`
    min-height: 100vh;
    background: radial-gradient(circle at 0% 0%, #3a3f47 0%, #1a1c22 100%);
    width: 100%;
  `,

  sider: css`
    background: rgba(58, 63, 71, 0.4) !important;
    backdrop-filter: blur(10px);
    border-right: 1px solid rgba(255, 255, 255, 0.08);

    .ant-layout-sider-children {
      display: flex;
      flex-direction: column;
    }

    .ant-menu {
      background: transparent !important;
      border: none !important;
    }

    .ant-menu-item-selected {
      background-color: rgba(255, 255, 255, 0.12) !important;
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
    }
  `,

  logoWrapper: css`
    height: 64px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 16px;
    margin-bottom: 8px;
  `,

  header: css`
    &.ant-layout-header {
      background: rgba(58, 63, 71, 0.6) !important;
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding: 0;
      display: flex;
      align-items: center;
    }
  `,

  triggerBtn: css`
    &.ant-btn {
      color: white;
      font-size: 18px;
      width: 64px;
      height: 64px;
      border: none;

      &:hover {
        background: rgba(255, 255, 255, 0.05) !important;
        color: ${token.colorPrimary};
      }
    }
  `,

  content: css`
    margin: 24px 16px;
    padding: 24px;
    min-height: 280px;
    background: rgba(58, 63, 71, 0.3) !important;
    backdrop-filter: blur(8px);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    color: white;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);

    h1,
    p {
      color: white;
    }
  `,

  imageIcon: css`
    filter: brightness(0) invert(1);
    object-fit: contain;
  `,

  logoutBtn: css`
    &.ant-btn {
      color: white;
      font-size: 14px;
      height: 64px;
      padding: 0 16px;
      margin-left: auto;
      border: none;

      &:hover {
        background: rgba(255, 255, 255, 0.05) !important;
        color: ${token.colorError};
      }
    }
  `,

  innerLayout: css`
    &.ant-layout {
      background: transparent;
    }
  `,
}));
```

## Inline Styling Rule

Inline styling should never be used.
All styling must be defined through the required `style.ts` pattern using `antd-style`.

## Enforcement Rule

For every new provider module, copy this exact pattern and only rename feature-specific types/actions/endpoints.
No structural deviations are allowed.
