/**
 * @fileoverview Vendor-model domain logic.
 * @description Machine-type default configurations, config enum value sets, the
 * create/update request field-gating rules, and the summary formatter. Shared
 * by the web and RN vendor apps so these product rules live in one place.
 */

import type {
  VendorModel,
  VendorModelType,
  VendorModelPricing,
  VendorModelSlot,
  VendorModelSlotPricing,
  VendorModelAction,
  VendorModelInterruption,
  VendorModelPayment,
} from '@sudobility/tapayoka_types';

/** All selectable machine types, in display order. */
export const MODEL_TYPES: VendorModelType[] = [
  'Washer',
  'Dryer',
  'Parking',
  'Locker',
  'Vending',
];

// Config enum value sets (UI attaches labels/i18n; these are the domain values).
export const MODEL_PRICING_VALUES: VendorModelPricing[] = ['fixed', 'variable'];
export const MODEL_SLOT_VALUES: VendorModelSlot[] = [
  'single',
  'multi1D',
  'multi2D',
];
export const SLOT_PRICING_VALUES: VendorModelSlotPricing[] = [
  'Tiered',
  'Unique',
];
export const MODEL_ACTION_VALUES: VendorModelAction[] = ['timed', 'sequence'];
export const MODEL_INTERRUPTION_VALUES: VendorModelInterruption[] = [
  'stop',
  'continue',
];
export const MODEL_PAYMENT_VALUES: VendorModelPayment[] = ['atStart', 'atEnd'];

/** The default configuration a machine type seeds when first selected. */
export interface VendorModelTypeDefaults {
  pricing: VendorModelPricing;
  slot: VendorModelSlot;
  slotPricing: VendorModelSlotPricing | null;
  action: VendorModelAction;
  interruption: VendorModelInterruption | null;
  payment: VendorModelPayment;
}

/** Per-type default configurations (encodes product rules per machine type). */
export const MODEL_TYPE_DEFAULTS: Record<
  VendorModelType,
  VendorModelTypeDefaults
> = {
  Washer: {
    pricing: 'variable',
    slot: 'single',
    slotPricing: null,
    action: 'timed',
    interruption: 'stop',
    payment: 'atStart',
  },
  Dryer: {
    pricing: 'variable',
    slot: 'single',
    slotPricing: null,
    action: 'timed',
    interruption: 'stop',
    payment: 'atStart',
  },
  Parking: {
    pricing: 'variable',
    slot: 'multi1D',
    slotPricing: 'Tiered',
    action: 'timed',
    interruption: 'continue',
    payment: 'atStart',
  },
  Locker: {
    pricing: 'variable',
    slot: 'multi1D',
    slotPricing: 'Tiered',
    action: 'timed',
    interruption: 'stop',
    payment: 'atEnd',
  },
  Vending: {
    pricing: 'fixed',
    slot: 'multi1D',
    slotPricing: 'Tiered',
    action: 'sequence',
    interruption: null,
    payment: 'atStart',
  },
};

/** Default configuration for a machine type. */
export function getModelTypeDefaults(
  type: VendorModelType
): VendorModelTypeDefaults {
  return MODEL_TYPE_DEFAULTS[type];
}

/** Raw (possibly-null) model config field values, as held in a form. */
export interface VendorModelConfigInput {
  pricing?: VendorModelPricing | null;
  slot?: VendorModelSlot | null;
  slotPricing?: VendorModelSlotPricing | null;
  action?: VendorModelAction | null;
  interruption?: VendorModelInterruption | null;
  payment?: VendorModelPayment | null;
}

/** The gated model config fields for a create/update request. */
export interface VendorModelConfig {
  pricing?: VendorModelPricing;
  slot?: VendorModelSlot;
  slotPricing?: VendorModelSlotPricing;
  action?: VendorModelAction;
  interruption?: VendorModelInterruption;
  payment?: VendorModelPayment;
}

/** Whether slot pricing applies (only multi-slot models have per-slot pricing). */
export function slotSupportsSlotPricing(
  slot: VendorModelSlot | null | undefined
): boolean {
  return !!slot && slot !== 'single';
}

/** Whether an interruption policy applies (only timed actions can be interrupted). */
export function actionSupportsInterruption(
  action: VendorModelAction | null | undefined
): boolean {
  return action === 'timed';
}

/**
 * Pricing is driven by the action: a `timed` action is metered by time, so it
 * is always `variable`. A `sequence` action may be priced `fixed` or `variable`
 * (the vendor's choice is passed through).
 */
export function pricingForAction(
  action: VendorModelAction | null | undefined,
  pricing: VendorModelPricing | null | undefined
): VendorModelPricing | undefined {
  if (action === 'timed') return 'variable';
  return pricing || undefined;
}

/** Whether the pricing choice is locked by the action (timed ⇒ variable). */
export function pricingLockedByAction(
  action: VendorModelAction | null | undefined
): boolean {
  return action === 'timed';
}

/**
 * Normalize raw model config field values into a request payload, applying the
 * domain gating rules: slot pricing only applies to multi-slot models, and
 * interruption only applies to timed actions.
 */
export function buildVendorModelConfig(
  input: VendorModelConfigInput
): VendorModelConfig {
  return {
    // Pricing is derived from the action: timed ⇒ variable (see pricingForAction).
    pricing: pricingForAction(input.action, input.pricing),
    slot: input.slot || undefined,
    slotPricing: slotSupportsSlotPricing(input.slot)
      ? input.slotPricing || undefined
      : undefined,
    action: input.action || undefined,
    interruption: actionSupportsInterruption(input.action)
      ? input.interruption || undefined
      : undefined,
    payment: input.payment || undefined,
  };
}

/** One-line "type · pricing · slot · action" summary of a model (or "—"). */
export function formatModelSummary(
  model: Pick<VendorModel, 'type' | 'pricing' | 'slot' | 'action'>
): string {
  return (
    [model.type, model.pricing, model.slot, model.action]
      .filter(Boolean)
      .join(' · ') || '—'
  );
}
