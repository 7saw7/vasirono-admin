import type {
  BranchDetail,
  BranchDetailAforoReport,
  BranchDetailAnalytics,
  BranchDetailContact,
  BranchDetailMedia,
  BranchDetailSchedule,
  BranchDetailService,
} from "./types";

export type BranchDetailRow = {
  branch_id: number | string;
  company_id: number | string;
  company_name: string;
  name: string;
  description: string | null;
  address: string;
  phone: string | null;
  email: string | null;
  district_name: string | null;
  lat: number | string | null;
  lon: number | string | null;
  is_main: boolean | null;
  is_active: boolean | null;
  created_at: Date | string;
  updated_at: Date | string;
};

export type BranchDetailContactRow = {
  contact_id: number | string;
  contact_type_name: string;
  value: string;
  label: string | null;
  is_primary: boolean | null;
  is_public: boolean | null;
  updated_at: Date | string | null;
};

export type BranchDetailScheduleRow = {
  schedule_id: number | string;
  day_name: string;
  iso_number: number | string;
  opening: string | null;
  closing: string | null;
  shift_number: number | string | null;
};

export type BranchDetailServiceRow = {
  service_id: number | string;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  is_available: boolean | null;
};

export type BranchDetailMediaRow = {
  media_id: number | string;
  media_type: string | null;
  url: string;
  updated_at: Date | string | null;
};

export type BranchDetailAnalyticsRow = {
  visits_count: number | string | null;
  reviews_count: number | string | null;
  average_rating: number | string | null;
  aforo_report_count: number | string | null;
  average_weighted_status: number | string | null;
  popularity_score: number | string | null;
  engagement_score: number | string | null;
  conversion_score: number | string | null;
  trust_score: number | string | null;
  freshness_score: number | string | null;
  final_score: number | string | null;
  calculated_at: Date | string | null;
};

export type BranchDetailAforoRow = {
  report_id: number | string;
  status_label: string | null;
  status_code: string | null;
  weight: number | string | null;
  gps_validated: boolean | null;
  created_at: Date | string;
};

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function toNullableNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toIsoString(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

export function mapBranchDetailContactRow(row: BranchDetailContactRow): BranchDetailContact {
  return {
    contactId: toNumber(row.contact_id),
    contactTypeName: row.contact_type_name,
    value: row.value,
    label: row.label,
    isPrimary: Boolean(row.is_primary),
    isPublic: Boolean(row.is_public),
    updatedAt: toIsoString(row.updated_at),
  };
}

export function mapBranchDetailScheduleRow(row: BranchDetailScheduleRow): BranchDetailSchedule {
  return {
    scheduleId: toNumber(row.schedule_id),
    dayName: row.day_name,
    isoNumber: toNumber(row.iso_number),
    opening: row.opening,
    closing: row.closing,
    shiftNumber: toNumber(row.shift_number),
  };
}

export function mapBranchDetailServiceRow(row: BranchDetailServiceRow): BranchDetailService {
  return {
    serviceId: toNumber(row.service_id),
    code: row.code,
    name: row.name,
    description: row.description,
    icon: row.icon,
    isAvailable: Boolean(row.is_available),
  };
}

export function mapBranchDetailMediaRow(row: BranchDetailMediaRow): BranchDetailMedia {
  return {
    mediaId: toNumber(row.media_id),
    mediaType: row.media_type,
    url: row.url,
    updatedAt: toIsoString(row.updated_at),
  };
}

export function mapBranchDetailAnalyticsRow(
  row: BranchDetailAnalyticsRow | undefined
): BranchDetailAnalytics {
  return {
    visitsCount: toNumber(row?.visits_count),
    reviewsCount: toNumber(row?.reviews_count),
    averageRating: toNumber(row?.average_rating),
    aforoReportCount: toNumber(row?.aforo_report_count),
    averageWeightedStatus: toNumber(row?.average_weighted_status),
    popularityScore: toNumber(row?.popularity_score),
    engagementScore: toNumber(row?.engagement_score),
    conversionScore: toNumber(row?.conversion_score),
    trustScore: toNumber(row?.trust_score),
    freshnessScore: toNumber(row?.freshness_score),
    finalScore: toNumber(row?.final_score),
    calculatedAt: toIsoString(row?.calculated_at),
  };
}

export function mapBranchDetailAforoRow(row: BranchDetailAforoRow): BranchDetailAforoReport {
  return {
    reportId: toNumber(row.report_id),
    statusLabel: row.status_label,
    statusCode: row.status_code,
    weight: toNullableNumber(row.weight),
    gpsValidated: Boolean(row.gps_validated),
    createdAt: toIsoString(row.created_at) ?? new Date(0).toISOString(),
  };
}

export function mapBranchDetailRow(
  row: BranchDetailRow,
  input: {
    contacts: BranchDetailContactRow[];
    schedules: BranchDetailScheduleRow[];
    services: BranchDetailServiceRow[];
    media: BranchDetailMediaRow[];
    analytics: BranchDetailAnalyticsRow | undefined;
    aforo: BranchDetailAforoRow[];
  }
): BranchDetail {
  return {
    branchId: toNumber(row.branch_id),
    companyId: toNumber(row.company_id),
    companyName: row.company_name,
    name: row.name,
    description: row.description,
    address: row.address,
    phone: row.phone,
    email: row.email,
    districtName: row.district_name,
    lat: toNullableNumber(row.lat),
    lon: toNullableNumber(row.lon),
    isMain: Boolean(row.is_main),
    isActive: Boolean(row.is_active),
    createdAt: toIsoString(row.created_at) ?? new Date(0).toISOString(),
    updatedAt: toIsoString(row.updated_at) ?? new Date(0).toISOString(),
    contacts: input.contacts.map(mapBranchDetailContactRow),
    schedules: input.schedules.map(mapBranchDetailScheduleRow),
    services: input.services.map(mapBranchDetailServiceRow),
    media: input.media.map(mapBranchDetailMediaRow),
    analytics: mapBranchDetailAnalyticsRow(input.analytics),
    aforo: input.aforo.map(mapBranchDetailAforoRow),
  };
}