import { IAbpResponse } from "@/interfaces/abp";
import {
  IActivityEventResult,
  IAlertListResult,
  IAlertRuleListItem,
  ICreateIncidentNoteInput,
  IDashboardOverview,
  IGenerateDemoActivityInput,
  IGetActivityEventsInput,
  IGetAlertsInput,
  IGetDashboardOverviewInput,
  IImportActivityEventsInput,
  IListResult,
  IIncidentNote,
  IMonitoredDatabase,
  IMonitoredServer,
  IMonitoringIntakeResult,
  ISecurityAlertDetail,
  IUpdateAlertRuleInput,
  IUpdateAlertStatusInput,
} from "@/interfaces/datasentinel";
import { axiosInstance } from "@/utils/axiosInstance";
import { unwrapAbpResponse } from "@/utils/abp";

export const getDashboardOverview = async (params?: IGetDashboardOverviewInput) => {
  const response = await axiosInstance().get<IAbpResponse<IDashboardOverview>>(
    "/api/services/app/Dashboards/GetOverview",
    {
      params,
    },
  );

  return unwrapAbpResponse(response.data);
};

export const getAlerts = async (params: IGetAlertsInput) => {
  const response = await axiosInstance().get<IAbpResponse<IAlertListResult>>(
    "/api/services/app/Alerts/GetPagedAlerts",
    {
      params,
    },
  );

  return unwrapAbpResponse(response.data);
};

export const getAlertDetail = async (id: number) => {
  const response = await axiosInstance().get<IAbpResponse<ISecurityAlertDetail>>(
    "/api/services/app/Alerts/GetAlertDetail",
    {
      params: { id },
    },
  );

  return unwrapAbpResponse(response.data);
};

export const updateAlertStatus = async (payload: IUpdateAlertStatusInput) => {
  const response = await axiosInstance().post<IAbpResponse<ISecurityAlertDetail>>(
    "/api/services/app/Alerts/UpdateStatus",
    payload,
  );

  return unwrapAbpResponse(response.data);
};

export const addAlertNote = async (payload: ICreateIncidentNoteInput) => {
  const response = await axiosInstance().post<IAbpResponse<IIncidentNote>>(
    "/api/services/app/Alerts/AddNote",
    payload,
  );

  return unwrapAbpResponse(response.data);
};

export const getActivityEvents = async (params: IGetActivityEventsInput) => {
  const response = await axiosInstance().get<IAbpResponse<IActivityEventResult>>(
    "/api/services/app/ActivityEvents/GetPagedActivityEvents",
    {
      params,
    },
  );

  return unwrapAbpResponse(response.data);
};

export const getAlertRules = async () => {
  const response = await axiosInstance().get<IAbpResponse<IListResult<IAlertRuleListItem>>>(
    "/api/services/app/AlertRules/GetRules",
  );

  return unwrapAbpResponse(response.data);
};

export const updateAlertRule = async (payload: IUpdateAlertRuleInput) => {
  const response = await axiosInstance().post<IAbpResponse<IAlertRuleListItem>>(
    "/api/services/app/AlertRules/UpdateRule",
    payload,
  );

  return unwrapAbpResponse(response.data);
};

export const generateDemoData = async (payload: IGenerateDemoActivityInput) => {
  const response = await axiosInstance().post<IAbpResponse<IMonitoringIntakeResult>>(
    "/api/services/app/MonitoringIntake/GenerateDemoData",
    payload,
  );

  return unwrapAbpResponse(response.data);
};

export const importActivityEvents = async (payload: IImportActivityEventsInput) => {
  const response = await axiosInstance().post<IAbpResponse<IMonitoringIntakeResult>>(
    "/api/services/app/MonitoringIntake/ImportActivityEvents",
    payload,
  );

  return unwrapAbpResponse(response.data);
};

export const getMonitoredServers = async () => {
  const response = await axiosInstance().get<IAbpResponse<IListResult<IMonitoredServer>>>(
    "/api/services/app/MonitoringIntake/GetMonitoredServers",
  );

  return unwrapAbpResponse(response.data);
};

export const getMonitoredDatabases = async () => {
  const response = await axiosInstance().get<IAbpResponse<IListResult<IMonitoredDatabase>>>(
    "/api/services/app/MonitoringIntake/GetMonitoredDatabases",
  );

  return unwrapAbpResponse(response.data);
};
