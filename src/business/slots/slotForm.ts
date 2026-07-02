/**
 * @fileoverview Slot form business logic (defaults, validation, request build).
 * @description Shared by the web and RN slot editors so the Tiered/Unique rules
 * and request shape stay identical.
 */

import type {
  PricingTier,
  SlotAction,
  VendorModelPricing,
  VendorModelPayment,
  VendorModelSlotPricing,
  VendorInstallationSlotCreateRequest,
} from '@sudobility/tapayoka_types';
import {
  makeDefaultVariableTier,
  makeDefaultFixedTier,
} from '../pricing/tierFactories';
import { canSaveAction } from '../pricing/action';

/** Auto-select a tier id when the offering has exactly one tier, else null. */
export function autoSelectTierId(tiers: PricingTier[]): string | null {
  return tiers.length === 1 ? tiers[0].id : null;
}

/** Seed a default custom tier for Unique-mode slots based on the model pricing. */
export function makeDefaultCustomTier(
  modelPricing: VendorModelPricing,
  currency: string
): PricingTier {
  return modelPricing === 'variable'
    ? makeDefaultVariableTier(currency, 'Default')
    : makeDefaultFixedTier(currency, 'Default');
}

export interface SlotFormState {
  label: string;
  slotPricing?: VendorModelSlotPricing | null;
  tiers: PricingTier[];
  selectedTierId: string | null;
  customPricingTier: PricingTier | null;
  /**
   * Per-slot relay action (multi-slot models). Defined regardless of Tiered vs
   * Unique pricing. Null for single-slot models, which keep the action on the tier.
   */
  action?: SlotAction | null;
  /** Model payment timing, so a two-phase (atEnd) action requires an end phase. */
  payment?: VendorModelPayment | null;
}

/**
 * Whether this slot collects a per-slot action: multi-slot models (identified
 * by having a slotPricing mode) define pins per slot; single-slot models don't.
 */
export function slotUsesAction(
  slotPricing?: VendorModelSlotPricing | null
): boolean {
  return slotPricing === 'Tiered' || slotPricing === 'Unique';
}

/** Whether the slot form has enough to save (pricing + per-slot action rules). */
export function canSaveSlot(state: SlotFormState): boolean {
  if (!state.label.trim()) return false;
  if (
    state.slotPricing === 'Tiered' &&
    state.tiers.length > 0 &&
    !state.selectedTierId
  ) {
    return false;
  }
  if (state.slotPricing === 'Unique' && !state.customPricingTier) return false;
  if (
    slotUsesAction(state.slotPricing) &&
    !canSaveAction(state.action, state.payment)
  ) {
    return false;
  }
  return true;
}

/** Build the slot create/update request from the form state. */
export function buildSlotRequest(
  state: Pick<
    SlotFormState,
    'label' | 'slotPricing' | 'selectedTierId' | 'customPricingTier' | 'action'
  >
): VendorInstallationSlotCreateRequest {
  const data: VendorInstallationSlotCreateRequest = {
    label: state.label.trim(),
  };
  if (state.slotPricing === 'Tiered' && state.selectedTierId) {
    data.pricingTierId = state.selectedTierId;
  }
  if (state.slotPricing === 'Unique' && state.customPricingTier) {
    data.pricingTier = state.customPricingTier;
  }
  if (slotUsesAction(state.slotPricing) && state.action) {
    data.action = state.action;
  }
  return data;
}
