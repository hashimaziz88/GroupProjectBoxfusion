import { axiosInstance } from "@/utils/axiosInstance";
import { unwrapAbpResponse } from "@/utils/abp";
import { IAbpResponse } from "@/interfaces/abp";
import { IPagedResult } from "@/interfaces/auth/adminService";
import {
  IAlertStatusHistoryItem,
  IBulkUpdateAlertStatusInput,
  ICreateIncidentNoteInput,
  IIncidentNote,
  ISecurityAlertDetail,
  ISecurityAlertFilterOptions,
  ISecurityAlertFilters,
  ISecurityAlertListItem,
  IUpdateAlertStatusInput,
} from "@/interfaces/datasentinel/alerts";

const mapFiltersToParams = (filters: ISecurityAlertFilters) => ({
  Keyword: filters.keyword,
  Severity: filters.severity,
  Status: filters.status,
  DatabaseId: filters.databaseId,
  StartDate: filters.startDate,
  EndDate: filters.endDate,
  SkipCount: filters.skipCount,
  MaxResultCount: filters.maxResultCount,
});

export const getSecurityAlerts = async (filters: ISecurityAlertFilters) => {
  const response = await axiosInstance().get<
    IAbpResponse<IPagedResult<ISecurityAlertListItem>>
  >("/api/services/app/SecurityAlert/GetPaged", {
    params: mapFiltersToParams(filters),
  });

  return unwrapAbpResponse(response.data);
};

export const getSecurityAlertById = async (id: string) => {
  const response = await axiosInstance().get<IAbpResponse<ISecurityAlertDetail>>(
    "/api/services/app/SecurityAlert/GetById",
    {
      params: { id },
    },
  );

  return unwrapAbpResponse(response.data);
};

export const updateSecurityAlertStatus = async (
  input: IUpdateAlertStatusInput,
) => {
  await axiosInstance().post("/api/services/app/SecurityAlert/UpdateStatus", input);
};

export const bulkUpdateSecurityAlertStatus = async (
  input: IBulkUpdateAlertStatusInput,
) => {
  await axiosInstance().post(
    "/api/services/app/SecurityAlert/BulkUpdateStatus",
    input,
  );
};

export const getSecurityAlertFilterOptions = async () => {
  const response = await axiosInstance().get<
    IAbpResponse<ISecurityAlertFilterOptions>
  >("/api/services/app/SecurityAlert/GetFilterOptions");

  return unwrapAbpResponse(response.data);
};

export const getIncidentNotes = async (alertId: string) => {
  const response = await axiosInstance().get<IAbpResponse<IIncidentNote[]>>(
    "/api/services/app/IncidentNote/GetByAlert",
    {
      params: { alertId },
    },
  );

  return unwrapAbpResponse(response.data);
};

export const createIncidentNote = async (input: ICreateIncidentNoteInput) => {
  const response = await axiosInstance().post<IAbpResponse<IIncidentNote>>(
    "/api/services/app/IncidentNote/Create",
    input,
  );

  return unwrapAbpResponse(response.data);
};

export const getAlertStatusHistory = async (alertId: string) => {
  const response = await axiosInstance().get<
    IAbpResponse<IAlertStatusHistoryItem[]>
  >("/api/services/app/AlertStatusHistory/GetByAlert", {
    params: { alertId },
  });

  return unwrapAbpResponse(response.data);
};

export const exportIncidentReport = async (alertId: string) => {
  const response = await axiosInstance().get<ArrayBuffer>(
    "/api/SecurityAlert/ExportReport",
    {
      params: { alertId },
      responseType: "arraybuffer",
    },
  );

  return response.data;
};
