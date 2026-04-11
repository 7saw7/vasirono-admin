export type BranchDetailContact = {
  contactId: number;
  contactTypeName: string;
  value: string;
  label: string | null;
  isPrimary: boolean;
  isPublic: boolean;
  updatedAt: string | null;
};

export type BranchDetailSchedule = {
  scheduleId: number;
  dayName: string;
  isoNumber: number;
  opening: string | null;
  closing: string | null;
  shiftNumber: number;
};

export type BranchDetailService = {
  serviceId: number;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  isAvailable: boolean;
};

export type BranchDetailMedia = {
  mediaId: number;
  mediaType: string | null;
  url: string;
  updatedAt: string | null;
};

export type BranchDetailAnalytics = {
  visitsCount: number;
  reviewsCount: number;
  averageRating: number;
  aforoReportCount: number;
  averageWeightedStatus: number;
  popularityScore: number;
  engagementScore: number;
  conversionScore: number;
  trustScore: number;
  freshnessScore: number;
  finalScore: number;
  calculatedAt: string | null;
};

export type BranchDetailAforoReport = {
  reportId: number;
  statusLabel: string | null;
  statusCode: string | null;
  weight: number | null;
  gpsValidated: boolean;
  createdAt: string;
};

export type BranchDetail = {
  branchId: number;
  companyId: number;
  companyName: string;
  name: string;
  description: string | null;
  address: string;
  phone: string | null;
  email: string | null;
  districtName: string | null;
  lat: number | null;
  lon: number | null;
  isMain: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  contacts: BranchDetailContact[];
  schedules: BranchDetailSchedule[];
  services: BranchDetailService[];
  media: BranchDetailMedia[];
  analytics: BranchDetailAnalytics;
  aforo: BranchDetailAforoReport[];
};