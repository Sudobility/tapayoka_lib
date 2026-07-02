/**
 * @fileoverview SlotAction helpers.
 * @description Defaults and validation for a slot's relay {@link SlotAction},
 * decoupled from pricing. Multi-slot models (locker, vending) define a per-slot
 * action; single-slot models keep it on the tier. Shared by the vendor apps.
 */

import type {
  SlotAction,
  OfferingSignal,
  VendorModelAction,
  VendorModelPayment,
} from '@sudobility/tapayoka_types';

const MIN_PIN = 0;
const MAX_PIN = 27;

/** A default start signal: a `timed` hold has no fixed duration; a pulse is 5s. */
function defaultStartSignal(type: VendorModelAction): OfferingSignal {
  return { pinNumber: 0, duration: type === 'timed' ? 0 : 5 };
}

/**
 * Build a default action for a model's action type and payment timing.
 * `atEnd` models get a second (end) phase to turn the relay back off.
 */
export function makeDefaultAction(
  type: VendorModelAction,
  payment?: VendorModelPayment | null
): SlotAction {
  const action: SlotAction = { type, start: [defaultStartSignal(type)] };
  if (payment === 'atEnd') action.end = [{ pinNumber: 0, duration: 5 }];
  return action;
}

/** Whether the model requires a two-phase (start + end) action. */
export function actionNeedsEndPhase(
  payment?: VendorModelPayment | null
): boolean {
  return payment === 'atEnd';
}

function signalsValid(signals: OfferingSignal[]): boolean {
  return signals.every(
    s =>
      Number.isInteger(s.pinNumber) &&
      s.pinNumber >= MIN_PIN &&
      s.pinNumber <= MAX_PIN &&
      s.duration >= 0
  );
}

/** Whether an action is complete enough to save, given the payment timing. */
export function canSaveAction(
  action: SlotAction | null | undefined,
  payment?: VendorModelPayment | null
): boolean {
  if (!action) return false;
  if (action.start.length === 0) return false;
  if (!signalsValid(action.start)) return false;
  if (actionNeedsEndPhase(payment)) {
    if (!action.end || action.end.length === 0) return false;
    if (!signalsValid(action.end)) return false;
  }
  return true;
}
