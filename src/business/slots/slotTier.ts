/**
 * @fileoverview Slot ↔ pricing-tier resolution.
 */

import type { PricingTier, VendorDeviceSlot } from '@sudobility/tapayoka_types';

/**
 * Resolve a slot's effective pricing-tier name for display: prefer the slot's
 * inline tier (Unique mode), otherwise look up the referenced offering tier by
 * id (Tiered mode). Returns undefined when the slot has no tier.
 */
export function resolveSlotTierName(
  slot: Pick<VendorDeviceSlot, 'pricingTier' | 'pricingTierId'>,
  offeringTiers: PricingTier[]
): string | undefined {
  return (
    slot.pricingTier?.name ??
    (slot.pricingTierId
      ? offeringTiers.find(t => t.id === slot.pricingTierId)?.name
      : undefined)
  );
}
