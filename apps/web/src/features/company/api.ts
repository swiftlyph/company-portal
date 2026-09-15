import { api, type RequestOptions } from "@/lib/api/client";
import type { CompanyProfile } from "./types";

function normalizeProfile(raw: Partial<CompanyProfile> | null | undefined): CompanyProfile {
  return {
    id: raw?.id ?? 0,
    name: raw?.name ?? "",
    status: raw?.status ?? "pending",
    legal_name: raw?.legal_name ?? null,
    address_line1: raw?.address_line1 ?? null,
    address_line2: raw?.address_line2 ?? null,
    city: raw?.city ?? null,
    postal_code: raw?.postal_code ?? null,
    phone: raw?.phone ?? null,
    contact_email: raw?.contact_email ?? null,
    tax_identifier: raw?.tax_identifier ?? null,
    created_at: raw?.created_at ?? "",
    updated_at: raw?.updated_at ?? "",
  };
}

export async function fetchCompanyProfile(options?: RequestOptions): Promise<CompanyProfile> {
  const raw = await api.get<Partial<CompanyProfile>>("/company/profile", options);
  return normalizeProfile(raw);
}
