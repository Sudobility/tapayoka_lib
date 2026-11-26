import { describe, it, expect } from 'vitest';
import type { PricingTier, SlotAction } from '@sudobility/tapayoka_types';
import {
  canSaveSlot,
  buildSlotRequest,
  slotCreateToUpdate,
  slotUsesAction,
} from '../slotForm';

const tier: PricingTier = {
  type: 'fixed',
  id: 'tier_1',
  name: 'Standard',
  currencyCode: 'USD',
  price: '3.00',
};

const customTier: PricingTier = {
  type: 'fixed',
  id: 'slot_custom',
  name: 'Custom',
  currencyCode: 'USD',
  price: '9.00',
};

const action: SlotAction = {
  type: 'sequence',
  start: [{ pinNumber: 5, duration: 5 }],
};

describe('slotForm — both-per-slot pricing', () => {
  it('single-slot models are label-only (no slotPricing mode)', () => {
    expect(slotUsesAction(null)).toBe(false);
    expect(
      canSaveSlot({
        label: 'Main',
        slotPricing: null,
        tiers: [tier],
        selectedTierId: null,
        customPricingTier: null,
        action: null,
      })
    ).toBe(true);
    // Pricing/action are dropped for single-slot slots.
    expect(
      buildSlotRequest({
        label: 'Main',
        slotPricing: null,
        selectedTierId: tier.id,
        customPricingTier: null,
        action,
      })
    ).toEqual({ label: 'Main' });
  });

  it('multi-slot needs a price (a tier OR a custom tier) and a valid action', () => {
    const base = {
      label: 'A1',
      slotPricing: 'Tiered' as const,
      tiers: [tier],
      action,
      payment: 'atStart' as const,
    };
    expect(
      canSaveSlot({ ...base, selectedTierId: null, customPricingTier: null })
    ).toBe(false);
    expect(
      canSaveSlot({ ...base, selectedTierId: tier.id, customPricingTier: null })
    ).toBe(true);
    expect(
      canSaveSlot({
        ...base,
        selectedTierId: null,
        customPricingTier: customTier,
      })
    ).toBe(true);
  });

  it('a custom price is allowed even on a Tiered model (both offered per slot)', () => {
    const req = buildSlotRequest({
      label: 'A1',
      slotPricing: 'Tiered',
      selectedTierId: null,
      customPricingTier: customTier,
      action,
    });
    expect(req).toEqual({ label: 'A1', pricingTier: customTier, action });
  });

  it('a selected tier wins over a custom tier if both are set', () => {
    const req = buildSlotRequest({
      label: 'A1',
      slotPricing: 'Unique',
      selectedTierId: tier.id,
      customPricingTier: customTier,
      action,
    });
    expect(req.pricingTierId).toBe(tier.id);
    expect(req.pricingTier).toBeUndefined();
  });

  it('slotCreateToUpdate nulls the complement so switching clears stale data', () => {
    expect(
      slotCreateToUpdate({ label: 'A1', pricingTierId: tier.id, action })
    ).toEqual({
      label: 'A1',
      pricingTierId: tier.id,
      pricingTier: null,
      action,
    });
    expect(
      slotCreateToUpdate({ label: 'A1', pricingTier: customTier, action })
    ).toEqual({
      label: 'A1',
      pricingTierId: null,
      pricingTier: customTier,
      action,
    });
    // Single-slot: everything cleared.
    expect(slotCreateToUpdate({ label: 'Main' })).toEqual({
      label: 'Main',
      pricingTierId: null,
      pricingTier: null,
      action: null,
    });
  });
});
