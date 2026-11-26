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
  VendorDeviceSlotCreateRequest,
  VendorDeviceSlotUpdateRequest,
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

/**
 * Whether the slot form has enough to save.
 *
 * Per-slot pricing and action apply to multi-slot models only (identified by
 * {@link slotUsesAction}); a single-slot slot is label-only, because its price
 * and relay action live on the offering tier. A multi-slot slot's price is
 * EITHER a selected offering tier OR its own custom tier — the editor offers
 * both and requires one.
 */
export function canSaveSlot(state: SlotFormState): boolean {
  if (!state.label.trim()) return false;
  if (!slotUsesAction(state.slotPricing)) return true;
  const hasPricing = !!state.selectedTierId || !!state.customPricingTier;
  if (!hasPricing) return false;
  return canSaveAction(state.action, state.payment);
}

/**
 * Build the slot create request from the form state. A multi-slot slot's price
 * is a selected offering tier OR its own custom tier (the tier wins if both are
 * somehow set); single-slot slots carry neither pricing nor action.
 */
export function buildSlotRequest(
  state: Pick<
    SlotFormState,
    'label' | 'slotPricing' | 'selectedTierId' | 'customPricingTier' | 'action'
  >
): VendorDeviceSlotCreateRequest {
  const data: VendorDeviceSlotCreateRequest = {
    label: state.label.trim(),
  };
  if (slotUsesAction(state.slotPricing)) {
    if (state.selectedTierId) {
      data.pricingTierId = state.selectedTierId;
    } else if (state.customPricingTier) {
      data.pricingTier = state.customPricingTier;
    }
    if (state.action) data.action = state.action;
  }
  return data;
}

/**
 * Convert a built create request into an update request, explicitly nulling the
 * pricing source and action that aren't set. Switching a slot between a shared
 * tier and a custom price (or clearing them) must clear the other field so no
 * stale pricing/action lingers.
 */
export function slotCreateToUpdate(
  data: VendorDeviceSlotCreateRequest
): VendorDeviceSlotUpdateRequest {
  return {
    ...data,
    pricingTierId: data.pricingTierId ?? null,
    pricingTier: data.pricingTier ?? null,
    action: data.action ?? null,
  };
}
