/**
 * @fileoverview Fixed-tier signal helpers.
 * @description Immutable add/remove/update operations on a FixedPricingTier's
 * signals, plus the default new-signal shape. Shared by the vendor apps.
 */

import type {
  FixedPricingTier,
  OfferingSignal,
} from '@sudobility/tapayoka_types';

/** A default new signal (pin 0, 5 seconds). */
export function makeDefaultSignal(): OfferingSignal {
  return { pinNumber: 0, duration: 5 };
}

// --- Generic signal-array helpers (reused for tier signals and action phases) ---

/** Return a copy of `signals` with a new default signal appended. */
export function appendSignal(signals: OfferingSignal[]): OfferingSignal[] {
  return [...signals, makeDefaultSignal()];
}

/** Return a copy of `signals` with the entry at `index` removed. */
export function removeSignalAt(
  signals: OfferingSignal[],
  index: number
): OfferingSignal[] {
  return signals.filter((_, i) => i !== index);
}

/** Return a copy of `signals` with the entry at `index` replaced. */
export function updateSignalAt(
  signals: OfferingSignal[],
  index: number,
  signal: OfferingSignal
): OfferingSignal[] {
  return signals.map((s, i) => (i === index ? signal : s));
}

// --- Legacy tier-level helpers (single-slot models edit the tier's signals) ---

/** Return a copy of the tier with a new default signal appended. */
export function addSignal(tier: FixedPricingTier): FixedPricingTier {
  return { ...tier, signals: appendSignal(tier.signals ?? []) };
}

/** Return a copy of the tier with the signal at `index` removed. */
export function removeSignal(
  tier: FixedPricingTier,
  index: number
): FixedPricingTier {
  return { ...tier, signals: removeSignalAt(tier.signals ?? [], index) };
}

/** Return a copy of the tier with the signal at `index` replaced. */
export function updateSignal(
  tier: FixedPricingTier,
  index: number,
  signal: OfferingSignal
): FixedPricingTier {
  return {
    ...tier,
    signals: updateSignalAt(tier.signals ?? [], index, signal),
  };
}
