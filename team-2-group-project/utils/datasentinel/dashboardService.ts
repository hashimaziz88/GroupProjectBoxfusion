import { IAbpResponse } from "@/interfaces/abp";
import { IPagedResult } from "@/interfaces/auth/adminService";
import { ISecurityAlertListItem } from "@/interfaces/datasentinel/alerts";
import {
  IDashboardActivityTrends,
  IDashboardAnomalyTimeline,
  IDashboardSeverityBreakdown,
  IDashboardSummary,
  IDashboardTopRisk,
  IDashboardTrendInput,
  IDashboardWindowInput,
  ITopRiskInput,
} from "@/interfaces/datasentinel/dashboard";
import { unwrapAbpResponse } from "@/utils/abp";
import { axiosInstance } from "@/utils/axiosInstance";

const mapWindowParams = (input: IDashboardWindowInput) => ({
  WindowDays: input.windowDays,
});

const mapTrendParams = (input: IDashboardTrendInput) => ({
  WindowDays: input.windowDays,
  BucketHours: input.bucketHours,
});

const mapTopRiskParams = (input: ITopRiskInput) => ({
  WindowDays: input.windowDays,
  MaxUsers: input.maxUsers,
  MaxEntities: input.maxEntities,
});

export const getDashboardSummary = async (input: IDashboardWindowInput) => {
  const response = await axiosInstance().get<IAbpResponse<IDashboardSummary>>(
    "/api/services/app/Dashboards/GetSummary",
    {
      params: mapWindowParams(input),
    },
  );

  return unwrapAbpResponse(response.data);
};

export const getDashboardActivityTrends = async (
  input: IDashboardTrendInput,
) => {
  const response = await axiosInstance().get<
    IAbpResponse<IDashboardActivityTrends>
  >("/api/services/app/Dashboards/GetActivityTrends", {
    params: mapTrendParams(input),
  });

  return unwrapAbpResponse(response.data);
};

export const getDashboardSeverityBreakdown = async (
  input: IDashboardWindowInput,
) => {
  const response = await axiosInstance().get<
    IAbpResponse<IDashboardSeverityBreakdown>
  >("/api/services/app/Dashboards/GetAlertsBySeverity", {
    params: mapWindowParams(input),
  });

  return unwrapAbpResponse(response.data);
};

export const getDashboardAnomalyTimeline = async (
  input: IDashboardTrendInput,
) => {
  const response = await axiosInstance().get<
    IAbpResponse<IDashboardAnomalyTimeline>
  >("/api/services/app/Dashboards/GetAnomalyTimeline", {
    params: mapTrendParams(input),
  });

  return unwrapAbpResponse(response.data);
};

export const getDashboardTopRisk = async (input: ITopRiskInput) => {
  const response = await axiosInstance().get<IAbpResponse<IDashboardTopRisk>>(
    "/api/services/app/Dashboards/GetTopRiskyUsersAndEntities",
    {
      params: mapTopRiskParams(input),
    },
  );

  return unwrapAbpResponse(response.data);
};

export const getDashboardRecentAlerts = async (
  windowDays: number,
  maxResultCount = 5,
) => {
  const response = await axiosInstance().get<
    IAbpResponse<IPagedResult<ISecurityAlertListItem>>
  >("/api/services/app/SecurityAlert/GetPaged", {
    params: {
      SkipCount: 0,
      MaxResultCount: maxResultCount,
      StartDate: new Date(
        Date.now() - Math.max(windowDays, 1) * 24 * 60 * 60 * 1000,
      ).toISOString(),
    },
  });

  return unwrapAbpResponse(response.data);
};
