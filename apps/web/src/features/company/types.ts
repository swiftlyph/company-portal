import type { CompanyStatus } from "@/lib/api/types";

/** GET /company/profile (CompanyProfileResource): flat, no `data` wrapper. */
export interface CompanyProfile {
  id: number;
  name: string;
  status: CompanyStatus;
  legal_name: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  postal_code: string | null;
  phone: string | null;
  contact_email: string | null;
  tax_identifier: string | null;
  created_at: string;
  updated_at: string;
}
