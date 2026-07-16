import { requireBackofficePage } from "@/lib/auth/page-guard";
import { notFound } from "next/navigation";
import { CompanyDetailView } from "./_components/CompanyDetailView";
import { getCompanyDetail } from "@/features/backoffice/companies/service";
import {
  getBusinessTypesList,
  getSubcategoriesList,
} from "@/features/backoffice/taxonomies/service";
import type {
  BusinessTypeListItem,
  SubcategoryListItem,
} from "@/features/backoffice/taxonomies/types";

type CompanyDetailPageProps = {
  params: Promise<{ companyId: string }>;
};

export const dynamic = "force-dynamic";

async function loadAllBusinessTypes() {
  const first = await getBusinessTypesList({ page: 1, pageSize: 100 });
  const pages = Math.ceil(first.total / 100);
  if (pages <= 1) return first.items;
  const rest = await Promise.all(
    Array.from({ length: pages - 1 }, (_, index) =>
      getBusinessTypesList({ page: index + 2, pageSize: 100 }),
    ),
  );
  return [first, ...rest].flatMap((page) => page.items);
}

async function loadAllSubcategories() {
  const first = await getSubcategoriesList({ page: 1, pageSize: 100 });
  const pages = Math.ceil(first.total / 100);
  if (pages <= 1) return first.items;
  const rest = await Promise.all(
    Array.from({ length: pages - 1 }, (_, index) =>
      getSubcategoriesList({ page: index + 2, pageSize: 100 }),
    ),
  );
  return [first, ...rest].flatMap((page) => page.items);
}

export default async function CompanyDetailPage({ params }: CompanyDetailPageProps) {
  const context = await requireBackofficePage("companies.read");
  const resolvedParams = await params;
  const companyId = Number(resolvedParams.companyId);

  if (!Number.isInteger(companyId) || companyId <= 0) notFound();

  const data = await getCompanyDetail(companyId);
  if (!data) notFound();

  const canManage = context.hasPermission("companies.update");
  const canReadTaxonomies = context.hasPermission("taxonomies.read");
  let businessTypes: BusinessTypeListItem[] = [];
  let subcategories: SubcategoryListItem[] = [];
  let taxonomyAvailable = canManage && canReadTaxonomies;

  if (taxonomyAvailable) {
    try {
      [businessTypes, subcategories] = await Promise.all([
        loadAllBusinessTypes(),
        loadAllSubcategories(),
      ]);
    } catch {
      taxonomyAvailable = false;
    }
  }

  return (
    <CompanyDetailView
      data={data}
      canManage={canManage}
      taxonomyAvailable={taxonomyAvailable}
      businessTypes={businessTypes}
      subcategories={subcategories}
    />
  );
}
