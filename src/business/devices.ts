/**
 * @fileoverview Device create-request construction.
 */

import type {
  SignedData,
  VendorDeviceCreateRequest,
} from '@sudobility/tapayoka_types';

/**
 * Build a vendor-device create request from a scanned device's signed
 * envelope, overriding the wallet address in the proof's data and assembling
 * the request shape. Keeps the request/proof construction out of the UI.
 */
export function buildVendorDeviceCreateRequest<
  T extends { walletAddress?: string },
>(input: {
  /** The scanned device's signed envelope (data + signing). */
  deviceProof: SignedData<T>;
  /** The wallet address to record for this device. */
  walletAddress: string;
  vendorOfferingId: string;
  label: string;
  connectionString?: string;
}): VendorDeviceCreateRequest {
  return {
    deviceProof: {
      ...input.deviceProof,
      data: { ...input.deviceProof.data, walletAddress: input.walletAddress },
    },
    vendorOfferingId: input.vendorOfferingId,
    label: input.label,
    ...(input.connectionString
      ? { connectionString: input.connectionString }
      : {}),
  };
}
