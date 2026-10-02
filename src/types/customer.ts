/**
 * Stored document photo. In the prototype `dataUrl` holds a base64 data URL
 * persisted to localStorage. Later this becomes a private storage reference.
 */
export interface StoredImage {
  dataUrl: string;
  fileName?: string;
  uploadedAt?: string;
}

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  dateOfBirth: string; // ISO date (yyyy-mm-dd)
  nationality: string;
  address: string;
  city: string;
  country: string;
  postalCode?: string;
  licenseNumber: string;
  licenseCountry: string;
  licenseExpiration: string; // ISO date
  licenseFrontImage?: StoredImage;
  licenseBackImage?: StoredImage;
  passportNumber?: string;
  passportCountry?: string;
  passportExpiration?: string;
  passportImage?: StoredImage;
  notes?: string;
  /** True when the customer still needs to complete their profile. */
  isProfileComplete: boolean;
  createdAt: string;
}
