/**
 * @fileoverview Pricing-tier display formatting.
 * @description Pure formatting helpers shared by the vendor apps. For the
 * one-line offering subtitle and authoritative price formatting, use
 * `formatPricingSubtitle` / `formatTierPrice` from `@sudobility/tapayoka_types`
 * (re-exported via `@sudobility/tapayoka_lib`). `formatTierSummary` below is the
 * compact "price / duration" label used in tier pickers.
 */

import type { PricingTier } from '@sudobility/tapayoka_types';

/**
 * Compact one-line summary of a single tier's price, e.g. `"2.50 USD / 30min"`
 * for a timed tier or `"5.00 USD"` for a fixed tier.
 */
export function formatTierSummary(tier: PricingTier): string {
  if (tier.type === 'timed') {
    const unit =
      tier.startDurationUnit === 'hours'
        ? 'hr'
        : tier.startDurationUnit === 'seconds'
          ? 'sec'
          : 'min';
    return `${tier.startPrice} ${tier.currencyCode} / ${tier.startDuration}${unit}`;
  }
  return `${tier.price} ${tier.currencyCode}`;
}

/** A tier line prefixed with its name, e.g. `"Standard: 2.50 USD / 30min"`. */
export function formatTierDetailLine(tier: PricingTier): string {
  return `${tier.name}: ${formatTierSummary(tier)}`;
}
