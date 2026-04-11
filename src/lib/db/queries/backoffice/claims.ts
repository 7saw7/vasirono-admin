import type { PoolClient } from "pg";
import { query, withTransaction } from "@/lib/db/server";
import type { ClaimDetailRow } from "@/features/backoffice/claims/mapper";

type IdRow = {
  id: number;
};

type ClaimStatusRow = {
  id: number;
  name: string;
};

type VerificationRequestStatusRow = {
  id: number;
};

type VerificationLevelRow = {
  id: number;
};

export async function getClaimDetailQuery(claimRequestId: number) {
  const { rows } = await query<ClaimDetailRow>(
    `
      select
        ccr.claim_request_id,
        ccr.company_id,
        c.name as company_name,
        u.id as user_id,
        u.name as claimant_name,
        u.email as claimant_email,
        crs.id as status_id,
        coalesce(crs.name, 'Sin estado') as status_name,
        lower(coalesce(crs.name, 'unknown')) as status_code,
        ccr.submitted_at,
        ccr.reviewed_at,
        reviewer.id as reviewed_by_id,
        reviewer.name as reviewed_by_name,
        ccr.notes,
        ccr.evidence_url,
        cvr.verification_request_id,
        bvrs.name as verification_status_name
      from company_claim_requests ccr
      inner join companies c
        on c.company_id = ccr.company_id
      inner join users u
        on u.id = ccr.user_id
      left join claim_request_statuses crs
        on crs.id = ccr.status_id
      left join users reviewer
        on reviewer.id = ccr.reviewed_by
      left join lateral (
        select
          vr.verification_request_id,
          vr.current_status_id
        from company_verification_requests vr
        where vr.claim_request_id = ccr.claim_request_id
        order by vr.verification_request_id desc
        limit 1
      ) cvr on true
      left join business_verification_request_statuses bvrs
        on bvrs.id = cvr.current_status_id
      where ccr.claim_request_id = $1
      limit 1
    `,
    [claimRequestId]
  );

  return rows[0] ?? null;
}

async function findClaimStatusIdByNames(
  client: PoolClient,
  names: string[]
): Promise<ClaimStatusRow | null> {
  const lowered = names.map((name) => name.toLowerCase());

  const { rows } = await client.query<ClaimStatusRow>(
    `
      select id, name
      from claim_request_statuses
      where lower(name) = any($1::text[])
      order by
        case
          when lower(name) = 'approved' then 1
          when lower(name) = 'rejected' then 1
          when lower(name) = 'in review' then 2
          else 10
        end,
        id asc
      limit 1
    `,
    [lowered]
  );

  return rows[0] ?? null;
}

async function findVerificationRequestStatusId(
  client: PoolClient
): Promise<number> {
  const preferred = ["pending", "submitted", "in_review", "under_review"];

  const { rows } = await client.query<VerificationRequestStatusRow>(
    `
      select id
      from business_verification_request_statuses
      where lower(code) = any($1::text[])
         or lower(name) = any($1::text[])
      order by
        case
          when lower(code) = 'pending' then 1
          when lower(name) = 'pending' then 1
          when lower(code) = 'submitted' then 2
          when lower(name) = 'submitted' then 2
          else 10
        end,
        id asc
      limit 1
    `,
    [preferred]
  );

  if (!rows[0]) {
    throw new Error("MISSING_VERIFICATION_REQUEST_STATUS");
  }

  return rows[0].id;
}

async function findVerificationLevelId(client: PoolClient): Promise<number> {
  const preferred = ["basic", "base", "manual"];

  const { rows } = await client.query<VerificationLevelRow>(
    `
      select id
      from business_verification_levels
      where lower(code) = any($1::text[])
         or lower(name) = any($1::text[])
      order by sort_order asc, id asc
      limit 1
    `,
    [preferred]
  );

  if (rows[0]) return rows[0].id;

  const fallback = await client.query<VerificationLevelRow>(
    `
      select id
      from business_verification_levels
      order by sort_order asc, id asc
      limit 1
    `
  );

  if (!fallback.rows[0]) {
    throw new Error("MISSING_VERIFICATION_LEVEL");
  }

  return fallback.rows[0].id;
}

export async function approveClaimQuery(input: {
  claimRequestId: number;
  reviewerUserId: string;
  notes?: string;
}) {
  return withTransaction(async (client) => {
    const detail = await client.query<ClaimDetailRow>(
      `
        select
          ccr.claim_request_id,
          ccr.company_id,
          c.name as company_name,
          u.id as user_id,
          u.name as claimant_name,
          u.email as claimant_email,
          crs.id as status_id,
          coalesce(crs.name, 'Sin estado') as status_name,
          lower(coalesce(crs.name, 'unknown')) as status_code,
          ccr.submitted_at,
          ccr.reviewed_at,
          reviewer.id as reviewed_by_id,
          reviewer.name as reviewed_by_name,
          ccr.notes,
          ccr.evidence_url,
          cvr.verification_request_id,
          bvrs.name as verification_status_name
        from company_claim_requests ccr
        inner join companies c
          on c.company_id = ccr.company_id
        inner join users u
          on u.id = ccr.user_id
        left join claim_request_statuses crs
          on crs.id = ccr.status_id
        left join users reviewer
          on reviewer.id = ccr.reviewed_by
        left join lateral (
          select
            vr.verification_request_id,
            vr.current_status_id
          from company_verification_requests vr
          where vr.claim_request_id = ccr.claim_request_id
          order by vr.verification_request_id desc
          limit 1
        ) cvr on true
        left join business_verification_request_statuses bvrs
          on bvrs.id = cvr.current_status_id
        where ccr.claim_request_id = $1
        limit 1
      `,
      [input.claimRequestId]
    );

    const claim = detail.rows[0];
    if (!claim) {
      throw new Error("CLAIM_NOT_FOUND");
    }

    const approvedStatus = await findClaimStatusIdByNames(client, ["approved", "accepted"]);
    if (!approvedStatus) {
      throw new Error("MISSING_APPROVED_CLAIM_STATUS");
    }

    await client.query(
      `
        update company_claim_requests
        set
          status_id = $2,
          reviewed_at = now(),
          reviewed_by = $3,
          notes = case
            when $4::text is null or trim($4::text) = '' then notes
            when notes is null or trim(notes) = '' then $4::text
            else notes || E'\\n\\n' || $4::text
          end,
          updated_at = now()
        where claim_request_id = $1
      `,
      [input.claimRequestId, approvedStatus.id, input.reviewerUserId, input.notes ?? null]
    );

    let verificationRequestId =
      claim.verification_request_id === null || claim.verification_request_id === undefined
        ? null
        : Number(claim.verification_request_id);

    if (!verificationRequestId) {
      const verificationStatusId = await findVerificationRequestStatusId(client);
      const verificationLevelId = await findVerificationLevelId(client);

      const insertVerification = await client.query<IdRow>(
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
          Number(claim.company_id),
          input.claimRequestId,
          claim.user_id,
          verificationStatusId,
          verificationLevelId,
          input.reviewerUserId,
        ]
      );

      verificationRequestId = insertVerification.rows[0]?.id ?? null;
    }

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
}) {
  return withTransaction(async (client) => {
    const exists = await client.query<{ claim_request_id: number }>(
      `
        select claim_request_id
        from company_claim_requests
        where claim_request_id = $1
        limit 1
      `,
      [input.claimRequestId]
    );

    if (!exists.rows[0]) {
      throw new Error("CLAIM_NOT_FOUND");
    }

    const rejectedStatus = await findClaimStatusIdByNames(client, ["rejected", "denied"]);
    if (!rejectedStatus) {
      throw new Error("MISSING_REJECTED_CLAIM_STATUS");
    }

    await client.query(
      `
        update company_claim_requests
        set
          status_id = $2,
          reviewed_at = now(),
          reviewed_by = $3,
          notes = case
            when $4::text is null or trim($4::text) = '' then notes
            when notes is null or trim(notes) = '' then $4::text
            else notes || E'\\n\\n' || $4::text
          end,
          updated_at = now()
        where claim_request_id = $1
      `,
      [input.claimRequestId, rejectedStatus.id, input.reviewerUserId, input.notes ?? null]
    );

    return {
      claimRequestId: input.claimRequestId,
      statusName: rejectedStatus.name,
      verificationRequestId: null,
    };
  });
}