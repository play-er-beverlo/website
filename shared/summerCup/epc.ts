import { payment } from "../data/summerCup";

export function buildCommunication(name: string, shortLabel: string): string {
  return `6RSC ${name.trim()} - ${shortLabel}`;
}

/**
 * Builds an EPC069-12 (version 002) SEPA Credit Transfer payload string.
 * Scannable by banking apps to prefill a transfer.
 */
export function buildEpcQrPayload(params: {
  name: string;
  shortLabel: string;
  amount: number;
}): string {
  const communication = buildCommunication(params.name, params.shortLabel);
  return [
    "BCD", // Service Tag
    "002", // Version
    "1", // Character set: UTF-8
    "SCT", // SEPA Credit Transfer
    payment.bic,
    payment.beneficiary,
    payment.ibanCompact,
    `EUR${params.amount.toFixed(2)}`,
    "", // Purpose (optional)
    "", // Structured remittance reference (optional)
    communication, // Unstructured remittance information
  ].join("\n");
}
