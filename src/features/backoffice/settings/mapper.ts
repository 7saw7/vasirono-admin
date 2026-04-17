import type {
  SimpleSettingItem,
  VerificationLevelItem,
  VerificationMethodItem,
  VerificationStatusItem,
} from "./types";

export type SimpleSettingRow = {
  id: number | string;
  name: string;
};

export type VerificationLevelRow = {
  id: number | string;
  code: string;
  name: string;
  description: string | null;
  sort_order: number | string | null;
};

export type VerificationMethodRow = {
  id: number | string;
  code: string;
  name: string;
  description: string | null;
  requires_document: boolean;
  requires_manual_review: boolean;
  is_active: boolean;
};

export type VerificationStatusRow = {
  id: number | string;
  code: string;
  name: string;
  description: string | null;
  sort_order: number | string | null;
  is_terminal: boolean;
};

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export function mapSimpleSettingRow(row: SimpleSettingRow): SimpleSettingItem {
  return {
    id: toNumber(row.id),
    name: row.name,
  };
}

export function mapVerificationLevelRow(
  row: VerificationLevelRow
): VerificationLevelItem {
  return {
    id: toNumber(row.id),
    code: row.code,
    name: row.name,
    description: row.description,
    sortOrder: toNumber(row.sort_order),
  };
}

export function mapVerificationMethodRow(
  row: VerificationMethodRow
): VerificationMethodItem {
  return {
    id: toNumber(row.id),
    code: row.code,
    name: row.name,
    description: row.description,
    requiresDocument: row.requires_document,
    requiresManualReview: row.requires_manual_review,
    isActive: row.is_active,
  };
}

export function mapVerificationStatusRow(
  row: VerificationStatusRow
): VerificationStatusItem {
  return {
    id: toNumber(row.id),
    code: row.code,
    name: row.name,
    description: row.description,
    sortOrder: toNumber(row.sort_order),
    isTerminal: row.is_terminal,
  };
}