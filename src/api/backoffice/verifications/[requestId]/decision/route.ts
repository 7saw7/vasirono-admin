export async function POST(request: NextRequest, context: any) {
  const auth = await getBackofficeContext("verifications.review");

  const requestId = Number(context.params.requestId);
  const body = await request.json();

  const decision = body.decision;

  if (!["approve", "reject"].includes(decision)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // ⚠️ aquí simplificado (puedes refinar luego)
  await query(
    `
    update company_verification_requests
    set
      current_status_id = (
        select id from business_verification_request_statuses
        where lower(code) = $2 or lower(name) = $2
        limit 1
      ),
      reviewed_at = now(),
      assigned_reviewer = $3,
      updated_at = now()
    where verification_request_id = $1
    `,
    [requestId, decision === "approve" ? "approved" : "rejected", auth.user.id]
  );

  return NextResponse.json({ ok: true });
}