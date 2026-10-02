export interface Tenant {
  id: string;
  businessName: string;
  legalName: string;
  logo: string; // text/initials wordmark used by the LogoMark component
  /** Resolved logo image URL (uploaded logo), if any. */
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  email: string;
  phone: string;
  secondaryPhone?: string;
  address: string;
  country: string;
  taxId?: string;
  currency: string; // ISO 4217, e.g. "USD"
  timezone: string;
  contractPrefix: string; // e.g. "AR"
  taxRate?: number; // ITBIS as a fraction (e.g. 0.18). Undefined = tax-exclusive.
  website?: string;
  /** DEMO contractual terms; replace with real terms later. */
  contractTerms: ContractTermsSection[];
}

export interface ContractTermsSection {
  title: string;
  body: string;
}
