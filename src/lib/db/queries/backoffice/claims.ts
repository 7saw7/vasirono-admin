import { createHash, randomInt } from "crypto";
import type { PoolClient } from "pg";
import { query, withTransaction } from "@/lib/db/server";
import type {
  ClaimDecisionResultRow,
  ClaimDetailRow,
  ClaimListRow,
  ClaimPublicContactRow,
  ClaimWhatsappVerificationRow,
} from "@/features/backoffice/claims/mapper";
import type {
  ClaimListFilters,
  OfficialChannelInput,
  OnsiteApprovalInput,
  OnsiteRequiredInput,
} from "@/features/backoffice/claims/types";

type CountRow = { total: number | string };
type IdRow = { id: number };
type StatusRow = { id: number; code: string; name: string };
type ClaimFlowActionRow = {
  claimRequestId: number;
  statusName: string;
  statusCode: string;
  verificationRequestId: number | null;
};
export type OfficialChannelChallengeDraftRow = {
  claimRequestId: number;
  companyId: number;
  companyName: string;
  branchId: number | null;
  branchName: string | null;
  verificationRequestId: number;
  verificationCheckId: number;
  channel: "email" | "whatsapp";
  to: string;
  code: string;
  codeExpiresAt: string;
};

function normalizedStatusCode(value: string | null | undefined) {
  return (value ?? "unknown").trim().toLowerCase();
}

function buildListClaimsWhere(filters: ClaimListFilters) {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters.search?.trim()) {
    params.push(`%${filters.search.trim()}%`);
    const index = params.length;
    clauses.push(`
      (
        c.name ilike $${index}
        or coalesce(cb.name, '') ilike $${index}
        or coalesce(ccr.applicant_name, u.name, '') ilike $${index}
        or coalesce(ccr.applicant_email, u.email, '') ilike $${index}
        or coalesce(ccr.applicant_phone, u.phone, '') ilike $${index}
        or coalesce(ccr.declared_channel_value, '') ilike $${index}
        or coalesce(ccr.notes, '') ilike $${index}
      )
    `);
  }

  if (filters.status?.trim()) {
    params.push(filters.status.trim().toLowerCase());
    const index = params.length;
    clauses.push(`
      (
        lower(coalesce(crs.code, crs.name, '')) = $${index}
        or lower(coalesce(crs.name, '')) = $${index}
      )
    `);
  }

  if (filters.companyId !== undefined && filters.companyId !== null) {
    params.push(Number(filters.companyId));
    clauses.push(`ccr.company_id = $${params.length}`);
  }

  return {
    params,
    whereSql: clauses.length > 0 ? `where ${clauses.join(" and ")}` : "",
  };
}

const CLAIM_SELECT = `
  ccr.claim_request_id,
  ccr.company_id,
  c.name as company_name,
  ccr.branch_id,
  cb.name as branch_name,
  cb.address as branch_address,
  cb.phone as branch_phone,
  cb.email as branch_email,
  u.id as user_id,
  coalesce(ccr.applicant_name, u.name) as claimant_name,
  coalesce(ccr.applicant_email, u.email) as claimant_email,
  coalesce(ccr.applicant_phone, u.phone) as claimant_phone,
  ccr.applicant_role,
  coalesce(ccr.source, 'public_web') as source,
  ccr.declared_channel_type,
  ccr.declared_channel_value,
  ccr.preferred_verification_route,
  ccr.onsite_visit_scheduled_at,
  ccr.onsite_visit_address,
  ccr.onsite_contact_person,
  ccr.onsite_contact_phone,
  ccr.onsite_visit_notes,
  crs.id as status_id,
  coalesce(crs.name_es, crs.name, 'Sin estado') as status_name,
  lower(coalesce(crs.code, crs.name, 'unknown')) as status_code,
  ccr.submitted_at,
  ccr.reviewed_at,
  reviewer.id as reviewed_by_id,
  reviewer.name as reviewed_by_name,
  ccr.notes,
  ccr.evidence_url,
  cvr.verification_request_id,
  coalesce(bvrs.name_es, bvrs.name) as verification_status_name,
  lower(coalesce(bvrs.code, bvrs.name)) as verification_status_code,
  coalesce(bvl.name_es, bvl.name) as verification_level
`;

const CLAIM_FROM = `
  from company_claim_requests ccr
  inner join companies c
    on c.company_id = ccr.company_id
  left join company_branches cb
    on cb.branch_id = ccr.branch_id
  left join users u
    on u.id = ccr.user_id
  left join claim_request_statuses crs
    on crs.id = ccr.status_id
  left join users reviewer
    on reviewer.id = ccr.reviewed_by
  left join lateral (
    select
      vr.verification_request_id,
      vr.current_status_id,
      vr.verification_level_id
    from company_verification_requests vr
    where vr.claim_request_id = ccr.claim_request_id
    order by vr.verification_request_id desc
    limit 1
  ) cvr on true
  left join business_verification_request_statuses bvrs
    on bvrs.id = cvr.current_status_id
  left join business_verification_levels bvl
    on bvl.id = cvr.verification_level_id
`;

export async function listClaimsQuery(filters: ClaimListFilters) {
  const page = typeof filters.page === "number" ? filters.page : Number(filters.page ?? 1);
  const pageSize =
    typeof filters.pageSize === "number"
      ? filters.pageSize
      : Number(filters.pageSize ?? 10);

  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safePageSize =
    Number.isFinite(pageSize) && pageSize > 0 ? Math.min(pageSize, 100) : 10;
  const offset = (safePage - 1) * safePageSize;

  const { params, whereSql } = buildListClaimsWhere(filters);

  const countResult = await query<CountRow>(
    `select count(*)::int as total ${CLAIM_FROM} ${whereSql}`,
    params
  );

  const listParams = [...params, safePageSize, offset];
  const limitParam = listParams.length - 1;
  const offsetParam = listParams.length;

  const listResult = await query<ClaimListRow>(
    `
      select
        ${CLAIM_SELECT},
        exists(
          select 1
          from company_verification_requests cvr2
          where cvr2.claim_request_id = ccr.claim_request_id
        ) as has_verification_request
      ${CLAIM_FROM}
      ${whereSql}
      order by ccr.submitted_at desc, ccr.claim_request_id desc
      limit $${limitParam} offset $${offsetParam}
    `,
    listParams
  );

  return {
    rows: listResult.rows,
    total: Number(countResult.rows[0]?.total ?? 0),
    page: safePage,
    pageSize: safePageSize,
  };
}

export async function getClaimDetailQuery(claimRequestId: number) {
  const { rows } = await query<ClaimDetailRow>(
    `
      select
        ${CLAIM_SELECT},
        exists(
          select 1
          from company_verification_requests cvr2
          where cvr2.claim_request_id = ccr.claim_request_id
        ) as has_verification_request
      ${CLAIM_FROM}
      where ccr.claim_request_id = $1
      limit 1
    `,
    [claimRequestId]
  );

  return rows[0] ?? null;
}

export async function getClaimPublicContactsQuery(claimRequestId: number) {
  const { rows } = await query<ClaimPublicContactRow>(
    `
      select
        cpcv.public_contact_verification_id,
        cpcv.contact_source,
        cpcv.contact_label,
        cpcv.contact_value,
        cpcv.normalized_contact_value,
        cpcv.matched_with_branch_contact,
        cpcv.evidence_url,
        cpcv.verified_at,
        reviewer.name as verified_by_name,
        cpcv.created_at
      from company_public_contact_verifications cpcv
      inner join company_verification_requests cvr
        on cvr.verification_request_id = cpcv.verification_request_id
      left join users reviewer
        on reviewer.id = cpcv.verified_by
      where cvr.claim_request_id = $1
      order by cpcv.created_at desc, cpcv.public_contact_verification_id desc
    `,
    [claimRequestId]
  );

  return rows;
}

export async function getClaimWhatsappVerificationsQuery(claimRequestId: number) {
  const { rows } = await query<ClaimWhatsappVerificationRow>(
    `
      select
        cwv.whatsapp_verification_id,
        cwv.public_phone,
        cwv.normalized_phone,
        cwv.attempts_count,
        cwv.max_attempts,
        cwv.status,
        cwv.sent_at,
        cwv.expires_at,
        cwv.verified_at,
        cwv.provider_name,
        cwv.failure_reason
      from company_whatsapp_verifications cwv
      inner join company_verification_requests cvr
        on cvr.verification_request_id = cwv.verification_request_id
      where cvr.claim_request_id = $1
      order by cwv.created_at desc, cwv.whatsapp_verification_id desc
    `,
    [claimRequestId]
  );

  return rows;
}

async function findClaimStatusByCodes(
  client: PoolClient,
  codes: string[],
  fallbackNames: string[] = []
): Promise<StatusRow | null> {
  const values = [...codes, ...fallbackNames].map((value) => value.toLowerCase());
  const { rows } = await client.query<StatusRow>(
    `
      select id, lower(coalesce(code, name)) as code, coalesce(name_es, name) as name
      from claim_request_statuses
      where lower(coalesce(code, name)) = any($1::text[])
         or lower(name) = any($1::text[])
      order by array_position($1::text[], lower(coalesce(code, name))), id asc
      limit 1
    `,
    [values]
  );
  return rows[0] ?? null;
}

async function findVerificationRequestStatusByCodes(
  client: PoolClient,
  codes: string[]
): Promise<StatusRow> {
  const values = codes.map((value) => value.toLowerCase());
  const { rows } = await client.query<StatusRow>(
    `
      select id, lower(coalesce(code, name)) as code, coalesce(name_es, name) as name
      from business_verification_request_statuses
      where lower(coalesce(code, name)) = any($1::text[])
         or lower(name) = any($1::text[])
      order by array_position($1::text[], lower(coalesce(code, name))), sort_order asc, id asc
      limit 1
    `,
    [values]
  );

  if (!rows[0]) throw new Error("MISSING_VERIFICATION_REQUEST_STATUS");
  return rows[0];
}

async function findVerificationLevelByCodes(
  client: PoolClient,
  codes: string[]
): Promise<StatusRow> {
  const values = codes.map((value) => value.toLowerCase());
  const { rows } = await client.query<StatusRow>(
    `
      select id, lower(coalesce(code, name)) as code, coalesce(name_es, name) as name
      from business_verification_levels
      where lower(coalesce(code, name)) = any($1::text[])
         or lower(name) = any($1::text[])
      order by array_position($1::text[], lower(coalesce(code, name))), sort_order asc, id asc
      limit 1
    `,
    [values]
  );

  if (!rows[0]) throw new Error("MISSING_VERIFICATION_LEVEL");
  return rows[0];
}

async function findVerificationMethodId(
  client: PoolClient,
  codes: string[]
): Promise<number> {
  const values = codes.map((value) => value.toLowerCase());
  const { rows } = await client.query<IdRow>(
    `
      select id
      from business_verification_methods
      where lower(coalesce(code, name)) = any($1::text[])
         or lower(name) = any($1::text[])
      order by array_position($1::text[], lower(coalesce(code, name))), id asc
      limit 1
    `,
    [values]
  );

  if (!rows[0]) throw new Error("MISSING_VERIFICATION_METHOD");
  return rows[0].id;
}

async function findVerificationCheckStatusId(
  client: PoolClient,
  codes: string[]
): Promise<number> {
  const values = codes.map((value) => value.toLowerCase());
  const { rows } = await client.query<IdRow>(
    `
      select id
      from business_verification_check_statuses
      where lower(coalesce(code, name)) = any($1::text[])
         or lower(name) = any($1::text[])
      order by array_position($1::text[], lower(coalesce(code, name))), sort_order asc, id asc
      limit 1
    `,
    [values]
  );

  if (!rows[0]) throw new Error("MISSING_VERIFICATION_CHECK_STATUS");
  return rows[0].id;
}

async function getClaimForUpdate(client: PoolClient, claimRequestId: number) {
  const { rows } = await client.query<ClaimDetailRow>(
    `
      select
        ${CLAIM_SELECT},
        exists(
          select 1
          from company_verification_requests cvr2
          where cvr2.claim_request_id = ccr.claim_request_id
        ) as has_verification_request
      ${CLAIM_FROM}
      where ccr.claim_request_id = $1
      for update of ccr
      limit 1
    `,
    [claimRequestId]
  );

  const claim = rows[0];
  if (!claim) throw new Error("CLAIM_NOT_FOUND");
  return claim;
}

async function ensureVerificationRequest(input: {
  client: PoolClient;
  claim: ClaimDetailRow;
  reviewerUserId: string;
  statusCodes: string[];
  levelCodes: string[];
}): Promise<number> {
  if (input.claim.verification_request_id) {
    const status = await findVerificationRequestStatusByCodes(
      input.client,
      input.statusCodes
    );
    const level = await findVerificationLevelByCodes(input.client, input.levelCodes);

    await input.client.query(
      `
        update company_verification_requests
        set
          current_status_id = $2,
          verification_level_id = coalesce(verification_level_id, $3),
          assigned_reviewer = coalesce(assigned_reviewer, $4),
          updated_at = now()
        where verification_request_id = $1
      `,
      [Number(input.claim.verification_request_id), status.id, level.id, input.reviewerUserId]
    );

    return Number(input.claim.verification_request_id);
  }

  const status = await findVerificationRequestStatusByCodes(input.client, input.statusCodes);
  const level = await findVerificationLevelByCodes(input.client, input.levelCodes);

  const insert = await input.client.query<IdRow>(
    `
      insert into company_verification_requests (
        company_id,
        claim_request_id,
        requested_by,
        current_status_id,
        verification_level_id,
        assigned_reviewer,
        started_at,
        created_at,
        updated_at
      )
      values ($1, $2, $3, $4, $5, $6, now(), now(), now())
      returning verification_request_id as id
    `,
    [
      Number(input.claim.company_id),
      Number(input.claim.claim_request_id),
      input.claim.user_id ?? input.reviewerUserId,
      status.id,
      level.id,
      input.reviewerUserId,
    ]
  );

  return insert.rows[0]?.id ?? 0;
}

async function appendClaimNote(input: {
  client: PoolClient;
  claimRequestId: number;
  statusId: number;
  reviewerUserId: string;
  notes?: string | null;
  extraSql?: string;
  extraParams?: unknown[];
}) {
  const extraParams = input.extraParams ?? [];
  await input.client.query(
    `
      update company_claim_requests
      set
        status_id = $2,
        reviewed_at = now(),
        reviewed_by = $3,
        notes = case
          when $4::text is null or trim($4::text) = '' then notes
          when notes is null or trim(notes) = '' then $4::text
          else notes || E'\n\n' || $4::text
        end,
        updated_at = now()
        ${input.extraSql ? `, ${input.extraSql}` : ""}
      where claim_request_id = $1
    `,
    [input.claimRequestId, input.statusId, input.reviewerUserId, input.notes ?? null, ...extraParams]
  );
}

function generateOtpCode() {
  return String(randomInt(100000, 999999));
}

function hashOtpCode(code: string) {
  const secret = process.env.BUSINESS_VERIFICATION_OTP_SECRET ?? process.env.NEXTAUTH_SECRET ?? "vasirono-dev-secret";
  return createHash("sha256").update(`${secret}:${code}`).digest("hex");
}

function normalizeWhatsapp(value: string) {
  const digits = value.replace(/[^0-9]/g, "");
  if (digits.startsWith("51")) return digits;
  if (digits.length === 9) return `51${digits}`;
  return digits;
}

function contactSourceForChannel(channelType: string) {
  if (channelType === "whatsapp") return "whatsapp_public";
  if (channelType === "phone") return "phone_public";
  if (["website", "instagram", "facebook", "tiktok"].includes(channelType)) return channelType;
  return "manual";
}

async function insertAudit(input: {
  client: PoolClient;
  verificationRequestId: number;
  actorUserId: string;
  action: string;
  details: unknown;
}) {
  await input.client.query(
    `
      insert into company_verification_audit_log (
        verification_request_id,
        actor_user_id,
        action,
        details,
        created_at
      )
      values ($1, $2, $3, $4::jsonb, now())
    `,
    [
      input.verificationRequestId,
      input.actorUserId,
      input.action,
      JSON.stringify(input.details ?? {}),
    ]
  );
}

export async function createOfficialChannelChallengeQuery(input: {
  claimRequestId: number;
  reviewerUserId: string;
  officialChannel: OfficialChannelInput;
}): Promise<OfficialChannelChallengeDraftRow> {
  return withTransaction(async (client) => {
    const claim = await getClaimForUpdate(client, input.claimRequestId);
    const channelType = input.officialChannel.channelType;

    if (!["email", "whatsapp"].includes(channelType)) {
      throw new Error("UNSUPPORTED_OFFICIAL_CHANNEL_FOR_CODE");
    }

    const claimStatus = await findClaimStatusByCodes(client, ["otp_pending"], ["OTP pending"]);
    if (!claimStatus) throw new Error("MISSING_CLAIM_STATUS");

    const verificationRequestId = await ensureVerificationRequest({
      client,
      claim,
      reviewerUserId: input.reviewerUserId,
      statusCodes: ["otp_pending", "in_review"],
      levelCodes: ["claimed", "official_channel_verified", "unclaimed"],
    });

    const methodId = await findVerificationMethodId(
      client,
      channelType === "whatsapp" ? ["official_whatsapp_otp"] : ["official_email"]
    );
    const checkStatusId = await findVerificationCheckStatusId(client, ["sent", "pending"]);
    const code = generateOtpCode();
    const codeHash = hashOtpCode(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const normalizedTo = channelType === "whatsapp" ? normalizeWhatsapp(input.officialChannel.channelValue) : input.officialChannel.channelValue.trim();

    const checkInsert = await client.query<IdRow>(
      `
        insert into company_verification_checks (
          verification_request_id,
          method_id,
          branch_id,
          status_id,
          score,
          confidence_score,
          reviewed_by,
          expires_at,
          notes,
          metadata,
          created_at,
          updated_at
        )
        values ($1, $2, $3, $4, 0, 0, $5, $6, $7, $8::jsonb, now(), now())
        returning verification_check_id as id
      `,
      [
        verificationRequestId,
        methodId,
        claim.branch_id ? Number(claim.branch_id) : null,
        checkStatusId,
        input.reviewerUserId,
        expiresAt,
        input.officialChannel.reviewerNotes ?? null,
        JSON.stringify({
          channelType,
          channelValue: input.officialChannel.channelValue.trim(),
          normalizedTo,
          codeHash,
          codeExpiresAt: expiresAt.toISOString(),
          deliveryMode: channelType === "whatsapp" ? "manual_link" : "email",
        }),
      ]
    );

    const verificationCheckId = checkInsert.rows[0]?.id;
    if (!verificationCheckId) throw new Error("CHECK_CREATION_FAILED");

    await client.query(
      `
        insert into company_public_contact_verifications (
          verification_request_id,
          verification_check_id,
          company_id,
          branch_id,
          contact_source,
          contact_label,
          contact_value,
          normalized_contact_value,
          is_primary,
          matched_with_branch_contact,
          evidence_url,
          metadata,
          verified_at,
          verified_by,
          created_at,
          updated_at
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, true, $9, $10, $11::jsonb, now(), $12, now(), now())
      `,
      [
        verificationRequestId,
        verificationCheckId,
        Number(claim.company_id),
        claim.branch_id ? Number(claim.branch_id) : null,
        contactSourceForChannel(channelType),
        channelType === "email" ? "email_public" : null,
        input.officialChannel.channelValue.trim(),
        normalizedTo,
        Boolean(input.officialChannel.matchedWithBranchContact),
        input.officialChannel.evidenceUrl ?? null,
        JSON.stringify({
          source: "backoffice_professional_flow",
          claimRequestId: input.claimRequestId,
        }),
        input.reviewerUserId,
      ]
    );

    if (channelType === "whatsapp") {
      await client.query(
        `
          insert into company_whatsapp_verifications (
            verification_request_id,
            verification_check_id,
            branch_id,
            public_phone,
            normalized_phone,
            otp_code_hash,
            attempts_count,
            max_attempts,
            sent_at,
            expires_at,
            provider_name,
            status,
            created_at,
            updated_at
          )
          values ($1, $2, $3, $4, $5, $6, 0, 5, now(), $7, 'manual_link', 'sent', now(), now())
        `,
        [
          verificationRequestId,
          verificationCheckId,
          claim.branch_id ? Number(claim.branch_id) : null,
          input.officialChannel.channelValue.trim(),
          normalizedTo,
          codeHash,
          expiresAt,
        ]
      );
    }

    await appendClaimNote({
      client,
      claimRequestId: input.claimRequestId,
      statusId: claimStatus.id,
      reviewerUserId: input.reviewerUserId,
      notes:
        input.officialChannel.reviewerNotes ||
        `Canal oficial ${channelType} registrado y código generado.`,
      extraSql:
        "declared_channel_type = coalesce(declared_channel_type, $5::text), declared_channel_value = coalesce(declared_channel_value, $6::text), preferred_verification_route = 'official_channel'",
      extraParams: [channelType, input.officialChannel.channelValue.trim()],
    });

    await insertAudit({
      client,
      verificationRequestId,
      actorUserId: input.reviewerUserId,
      action: "official_channel_code_prepared",
      details: {
        channelType,
        to: normalizedTo,
        verificationCheckId,
        expiresAt: expiresAt.toISOString(),
      },
    });

    return {
      claimRequestId: input.claimRequestId,
      companyId: Number(claim.company_id),
      companyName: claim.company_name,
      branchId: claim.branch_id ? Number(claim.branch_id) : null,
      branchName: claim.branch_name,
      verificationRequestId,
      verificationCheckId,
      channel: channelType as "email" | "whatsapp",
      to: normalizedTo,
      code,
      codeExpiresAt: expiresAt.toISOString(),
    };
  });
}

export async function markClaimOnsiteRequiredQuery(input: {
  claimRequestId: number;
  reviewerUserId: string;
  onsite: OnsiteRequiredInput;
}): Promise<ClaimFlowActionRow> {
  return withTransaction(async (client) => {
    const claim = await getClaimForUpdate(client, input.claimRequestId);
    const scheduled = input.onsite.scheduledAt?.trim() || null;
    const statusCodes = scheduled ? ["visit_scheduled", "visit_required"] : ["visit_required"];
    const claimStatus = await findClaimStatusByCodes(client, statusCodes, ["Visit required"]);
    if (!claimStatus) throw new Error("MISSING_CLAIM_STATUS");

    const verificationRequestId = await ensureVerificationRequest({
      client,
      claim,
      reviewerUserId: input.reviewerUserId,
      statusCodes: statusCodes,
      levelCodes: ["claimed", "unclaimed"],
    });

    const methodId = await findVerificationMethodId(client, ["onsite_visit"]);
    const checkStatusId = await findVerificationCheckStatusId(client, ["pending"]);

    await client.query(
      `
        insert into company_verification_checks (
          verification_request_id,
          method_id,
          branch_id,
          status_id,
          reviewed_by,
          notes,
          metadata,
          created_at,
          updated_at
        )
        values ($1, $2, $3, $4, $5, $6, $7::jsonb, now(), now())
      `,
      [
        verificationRequestId,
        methodId,
        claim.branch_id ? Number(claim.branch_id) : null,
        checkStatusId,
        input.reviewerUserId,
        input.onsite.notes ?? null,
        JSON.stringify({
          scheduledAt: scheduled,
          visitAddress: input.onsite.visitAddress ?? null,
          contactPerson: input.onsite.contactPerson ?? null,
          contactPhone: input.onsite.contactPhone ?? null,
        }),
      ]
    );

    await appendClaimNote({
      client,
      claimRequestId: input.claimRequestId,
      statusId: claimStatus.id,
      reviewerUserId: input.reviewerUserId,
      notes: input.onsite.notes || "Se requiere verificación presencial.",
      extraSql:
        "preferred_verification_route = 'onsite_visit', onsite_visit_scheduled_at = $5::timestamptz, onsite_visit_address = $6::text, onsite_contact_person = $7::text, onsite_contact_phone = $8::text, onsite_visit_notes = $9::text",
      extraParams: [
        scheduled,
        input.onsite.visitAddress ?? claim.branch_address ?? null,
        input.onsite.contactPerson ?? claim.claimant_name ?? null,
        input.onsite.contactPhone ?? claim.claimant_phone ?? null,
        input.onsite.notes ?? null,
      ],
    });

    await insertAudit({
      client,
      verificationRequestId,
      actorUserId: input.reviewerUserId,
      action: scheduled ? "onsite_visit_scheduled" : "onsite_visit_required",
      details: input.onsite,
    });

    return {
      claimRequestId: input.claimRequestId,
      statusName: claimStatus.name,
      statusCode: normalizedStatusCode(claimStatus.code),
      verificationRequestId,
    };
  });
}

export async function approveOnsiteVerificationQuery(input: {
  claimRequestId: number;
  reviewerUserId: string;
  approval: OnsiteApprovalInput;
}): Promise<ClaimFlowActionRow> {
  return withTransaction(async (client) => {
    const claim = await getClaimForUpdate(client, input.claimRequestId);
    const claimStatus = await findClaimStatusByCodes(client, ["onsite_review_passed"], ["Onsite review passed"]);
    if (!claimStatus) throw new Error("MISSING_CLAIM_STATUS");

    const verificationRequestId = await ensureVerificationRequest({
      client,
      claim,
      reviewerUserId: input.reviewerUserId,
      statusCodes: ["onsite_review_passed", "approved"],
      levelCodes: input.approval.documentsReviewed
        ? ["vasirono_verified", "onsite_verified"]
        : ["onsite_verified"],
    });

    const level = await findVerificationLevelByCodes(
      client,
      input.approval.documentsReviewed
        ? ["vasirono_verified", "onsite_verified"]
        : ["onsite_verified"]
    );
    const methodId = await findVerificationMethodId(client, ["onsite_visit"]);
    const checkStatusId = await findVerificationCheckStatusId(client, ["approved", "verified"]);

    await client.query(
      `
        insert into company_verification_checks (
          verification_request_id,
          method_id,
          branch_id,
          status_id,
          score,
          confidence_score,
          reviewed_by,
          verified_at,
          notes,
          metadata,
          created_at,
          updated_at
        )
        values ($1, $2, $3, $4, 100, 100, $5, now(), $6, $7::jsonb, now(), now())
      `,
      [
        verificationRequestId,
        methodId,
        claim.branch_id ? Number(claim.branch_id) : null,
        checkStatusId,
        input.reviewerUserId,
        input.approval.notes,
        JSON.stringify({
          documentsReviewed: Boolean(input.approval.documentsReviewed),
          addressVerified: input.approval.addressVerified !== false,
          source: "backoffice_onsite_approval",
        }),
      ]
    );

    await client.query(
      `
        insert into company_verification_profiles (
          company_id,
          latest_verification_request_id,
          verification_level_id,
          verification_score,
          is_identity_verified,
          is_whatsapp_verified,
          is_address_verified,
          is_document_verified,
          is_manual_review_completed,
          verified_at,
          notes,
          updated_at
        )
        values ($1, $2, $3, $4, true, false, $5, $6, true, now(), $7, now())
        on conflict (company_id) do update set
          latest_verification_request_id = excluded.latest_verification_request_id,
          verification_level_id = excluded.verification_level_id,
          verification_score = greatest(company_verification_profiles.verification_score, excluded.verification_score),
          is_identity_verified = true,
          is_address_verified = company_verification_profiles.is_address_verified or excluded.is_address_verified,
          is_document_verified = company_verification_profiles.is_document_verified or excluded.is_document_verified,
          is_manual_review_completed = true,
          verified_at = coalesce(company_verification_profiles.verified_at, now()),
          notes = excluded.notes,
          updated_at = now()
      `,
      [
        Number(claim.company_id),
        verificationRequestId,
        level.id,
        input.approval.documentsReviewed ? 100 : 85,
        input.approval.addressVerified !== false,
        Boolean(input.approval.documentsReviewed),
        input.approval.notes,
      ]
    );

    await appendClaimNote({
      client,
      claimRequestId: input.claimRequestId,
      statusId: claimStatus.id,
      reviewerUserId: input.reviewerUserId,
      notes: input.approval.notes,
      extraSql: "preferred_verification_route = 'onsite_visit'",
    });

    await insertAudit({
      client,
      verificationRequestId,
      actorUserId: input.reviewerUserId,
      action: "onsite_verification_approved",
      details: input.approval,
    });

    return {
      claimRequestId: input.claimRequestId,
      statusName: claimStatus.name,
      statusCode: normalizedStatusCode(claimStatus.code),
      verificationRequestId,
    };
  });
}

export async function requestMoreEvidenceClaimQuery(input: {
  claimRequestId: number;
  reviewerUserId: string;
  notes?: string | null;
}): Promise<ClaimFlowActionRow> {
  return withTransaction(async (client) => {
    const claim = await getClaimForUpdate(client, input.claimRequestId);
    const claimStatus = await findClaimStatusByCodes(client, ["needs_more_evidence"], ["Needs more evidence"]);
    if (!claimStatus) throw new Error("MISSING_CLAIM_STATUS");

    await appendClaimNote({
      client,
      claimRequestId: input.claimRequestId,
      statusId: claimStatus.id,
      reviewerUserId: input.reviewerUserId,
      notes: input.notes || "Se solicitó más evidencia al negocio.",
    });

    const verificationRequestId = claim.verification_request_id ? Number(claim.verification_request_id) : null;
    if (verificationRequestId) {
      await insertAudit({
        client,
        verificationRequestId,
        actorUserId: input.reviewerUserId,
        action: "claim_needs_more_evidence",
        details: { notes: input.notes ?? null },
      });
    }

    return {
      claimRequestId: input.claimRequestId,
      statusName: claimStatus.name,
      statusCode: normalizedStatusCode(claimStatus.code),
      verificationRequestId,
    };
  });
}

// Legacy simple decision actions kept for backwards compatibility.
export async function approveClaimQuery(input: {
  claimRequestId: number;
  reviewerUserId: string;
  notes?: string;
}): Promise<ClaimDecisionResultRow> {
  return withTransaction(async (client) => {
    const claim = await getClaimForUpdate(client, input.claimRequestId);
    const approvedStatus = await findClaimStatusByCodes(client, ["approved_basic_access", "approved"], ["approved", "accepted"]);
    if (!approvedStatus) throw new Error("MISSING_APPROVED_CLAIM_STATUS");

    const verificationRequestId = await ensureVerificationRequest({
      client,
      claim,
      reviewerUserId: input.reviewerUserId,
      statusCodes: ["approved", "in_review"],
      levelCodes: ["claimed"],
    });

    await appendClaimNote({
      client,
      claimRequestId: input.claimRequestId,
      statusId: approvedStatus.id,
      reviewerUserId: input.reviewerUserId,
      notes: input.notes,
    });

    return {
      claimRequestId: input.claimRequestId,
      statusName: approvedStatus.name,
      verificationRequestId,
    };
  });
}

export async function rejectClaimQuery(input: {
  claimRequestId: number;
  reviewerUserId: string;
  notes?: string;
}): Promise<ClaimDecisionResultRow> {
  return withTransaction(async (client) => {
    await getClaimForUpdate(client, input.claimRequestId);
    const rejectedStatus = await findClaimStatusByCodes(client, ["rejected"], ["denied"]);
    if (!rejectedStatus) throw new Error("MISSING_REJECTED_CLAIM_STATUS");

    await appendClaimNote({
      client,
      claimRequestId: input.claimRequestId,
      statusId: rejectedStatus.id,
      reviewerUserId: input.reviewerUserId,
      notes: input.notes,
    });

    return {
      claimRequestId: input.claimRequestId,
      statusName: rejectedStatus.name,
      verificationRequestId: null,
    };
  });
}
