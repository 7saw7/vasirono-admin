import { TaxonomiesView } from "./_components/TaxonomiesView";
import { getTaxonomiesDashboard } from "@/features/backoffice/taxonomies/service";

type TaxonomiesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getFirst(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function TaxonomiesPage({
  searchParams,
}: TaxonomiesPageProps) {
  const params = (await searchParams) ?? {};

  const data = await getTaxonomiesDashboard({
    businessTypes: {
      search: getFirst(params.btSearch),
      page: getFirst(params.btPage),
      pageSize: 10,
    },
    categories: {
      search: getFirst(params.catSearch),
      page: getFirst(params.catPage),
      pageSize: 10,
    },
    subcategories: {
      search: getFirst(params.subSearch),
      categoryId: getFirst(params.subCategoryId),
      page: getFirst(params.subPage),
      pageSize: 10,
    },
    services: {
      search: getFirst(params.srvSearch),
      active: getFirst(params.srvActive),
      page: getFirst(params.srvPage),
      pageSize: 10,
    },
  });

  return <TaxonomiesView data={data} />;
}