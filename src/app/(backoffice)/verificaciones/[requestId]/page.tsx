export default async function Page({ params }: any) {
  const data = await getVerificationDetail(Number(params.requestId));

  if (!data) return notFound();

  return <VerificationRequestDetailView data={data} />;
}