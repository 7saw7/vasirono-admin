export type CompanyListFilters = {
  search?: string;
  verificationStatus?: string;
  subscriptionStatus?: string;
  page?: string | number;
  pageSize?: string | number;
};

export type CompanyListItem = {
  companyId: number;
  name: string;
  email: string | null;
  phone: string | null;
  verificationStatus: string;
  verificationStatusCode: string;
  verificationLevel: string | null;
  verificationScore: number;
  planName: string | null;
  subscriptionStatus: string | null;
  branchesCount: number;
  activeBranchesCount: number;
  districtLabel: string | null;
  pendingClaimsCount: number;
  updatedAt: string;
};

export type CompanyListResult = {
  items: CompanyListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages?: number;
};

export type CompanyDetailBranch = {
  branchId: number;
  name: string;
  address: string;
  districtName: string | null;
  phone: string | null;
  email: string | null;
  isMain: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CompanyDetailMediaItem = {
  mediaId: number;
  mediaType: string | null;
  url: string;
  createdAt: string | null;
};

export type CompanyDetailVerification = {
  statusLabel: string;
  profileLevel: string | null;
  verificationScore: number;
  isIdentityVerified: boolean;
  isWhatsappVerified: boolean;
  isAddressVerified: boolean;
  isDocumentVerified: boolean;
  isManualReviewCompleted: boolean;
  verifiedAt: string | null;
  expiresAt: string | null;
  latestRequestId: number | null;
  latestRequestStatus: string | null;
  latestRequestSubmittedAt: string | null;
};

export type CompanyDetailSubscription = {
  subscriptionId: number | null;
  planName: string | null;
  statusName: string | null;
  startDate: string | null;
  endDate: string | null;
};

export type CompanyDetailPayment = {
  paymentId: number;
  amount: number;
  statusName: string | null;
  paymentMethodName: string | null;
  createdAt: string;
};

export type CompanyDetailClaim = {
  claimRequestId: number;
  statusName: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  notes: string | null;
  evidenceUrl: string | null;
};

export type CompanyDetailAuditItem = {
  auditLogId: number;
  action: string;
  oldStatusName: string | null;
  newStatusName: string | null;
  actorName: string | null;
  createdAt: string;
};

export type CompanyBusinessType = {
  typeId: number;
  name: string | null;
};

export type CompanySubcategory = {
  subcategoryId: number;
  categoryId: number;
  categoryName: string;
  name: string;
  priceId: number | null;
};

export type CompanyUpdateProfileInput = {
  name?: string;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  lat?: number | null;
  lon?: number | null;
  priceId?: number | null;
};

export type CompanyUpdateTaxonomyInput = {
  businessTypeIds: number[];
  subcategories: Array<{
    subcategoryId: number;
    priceId?: number | null;
  }>;
};

export type CompanyDetail = {
  companyId: number;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  lat: number | null;
  lon: number | null;
  isActive: boolean;
  priceId: number | null;
  verificationStatus: string;
  createdAt: string;
  updatedAt: string;
  businessTypes: CompanyBusinessType[];
  subcategories: CompanySubcategory[];
  branches: CompanyDetailBranch[];
  media: CompanyDetailMediaItem[];
  verification: CompanyDetailVerification;
  subscription: CompanyDetailSubscription;
  payments: CompanyDetailPayment[];
  claims: CompanyDetailClaim[];
  audit: CompanyDetailAuditItem[];
};
