import { TenantAvailabilityState } from "@/enums/auth/tenantService";

export interface ITenantContext {
  tenantId?: number | null;
  tenancyName?: string | null;
}

export interface IIsTenantAvailableResponse {
  state: TenantAvailabilityState;
  tenantId?: number | null;
}
