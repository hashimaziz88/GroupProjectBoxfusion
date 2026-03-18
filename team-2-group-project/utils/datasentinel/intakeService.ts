import { axiosInstance } from "@/utils/axiosInstance";
import { unwrapAbpResponse } from "@/utils/abp";
import { IAbpResponse } from "@/interfaces/abp";
import {
  IActivityEventIngestionResult,
  IIngestAbpAuditLogsInput,
  IIngestActivityEventsInput,
  ISeedSimulatedAbpAuditLogsInput,
} from "@/interfaces/datasentinel/intake";

export const ingestActivityEvents = async (
  input: IIngestActivityEventsInput,
) => {
  const response = await axiosInstance().post<
    IAbpResponse<IActivityEventIngestionResult>
  >("/api/services/app/ActivityEvent/Ingest", input);

  return unwrapAbpResponse(response.data);
};

export const ingestAbpAuditLogs = async (input: IIngestAbpAuditLogsInput) => {
  const response = await axiosInstance().post<
    IAbpResponse<IActivityEventIngestionResult>
  >("/api/services/app/ActivityEvent/IngestAbpAuditLogs", input);

  return unwrapAbpResponse(response.data);
};

export const seedSimulatedAbpAuditLogs = async (
  input: ISeedSimulatedAbpAuditLogsInput,
) => {
  const response = await axiosInstance().post<
    IAbpResponse<IActivityEventIngestionResult>
  >("/api/services/app/ActivityEvent/SeedSimulatedAbpAuditLogs", input);

  return unwrapAbpResponse(response.data);
};

export const importBatch = async (input: IIngestActivityEventsInput) => {
  const response = await axiosInstance().post<
    IAbpResponse<IActivityEventIngestionResult>
  >("/api/services/app/ActivityEvent/ImportBatch", input);

  return unwrapAbpResponse(response.data);
};
