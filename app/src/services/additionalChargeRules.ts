import {
  loadPropertySettings,
  type AdditionalChargeRule,
} from '@/services/propertySettings';
import {
  loadRoomAdditionalChargeOverrides,
  type RoomAdditionalChargeOverrides,
} from '@/services/roomAdditionalChargeOverrides';
import { Room } from '@/types/room';

export interface RoomAdditionalChargeContext {
  activeRules: AdditionalChargeRule[];
  activeRuleIds: string[];
  activeRulesById: Map<string, AdditionalChargeRule>;
  roomOverrides: RoomAdditionalChargeOverrides;
  defaultChargePerRoom: number;
}

function normalizeChargeAmount(amount: number): number {
  return Math.max(0, Math.round(amount));
}

export function calculateAdditionalChargePerRoom(
  rules: AdditionalChargeRule[]
): number {
  return normalizeChargeAmount(
    rules
      .filter((rule) => rule.isActive)
      .reduce((sum, rule) => sum + rule.amount, 0)
  );
}

export function loadActiveAdditionalChargeRules(): AdditionalChargeRule[] {
  const settings = loadPropertySettings();
  return settings.additionalChargeRules.filter((rule) => rule.isActive);
}

export function buildRoomAdditionalChargeContext(
  rules: AdditionalChargeRule[] = loadPropertySettings().additionalChargeRules,
  roomOverrides: RoomAdditionalChargeOverrides =
    loadRoomAdditionalChargeOverrides()
): RoomAdditionalChargeContext {
  const activeRules = rules.filter((rule) => rule.isActive);
  const activeRuleIds = activeRules.map((rule) => rule.id);
  const activeRulesById = new Map(
    activeRules.map((rule) => [rule.id, rule] as const)
  );

  return {
    activeRules,
    activeRuleIds,
    activeRulesById,
    roomOverrides,
    defaultChargePerRoom: calculateAdditionalChargePerRoom(activeRules),
  };
}

function resolveRoomRuleIds(
  roomNumber: string,
  context: RoomAdditionalChargeContext
): string[] {
  const overrideRuleIds = context.roomOverrides[roomNumber];
  if (!overrideRuleIds) {
    return context.activeRuleIds;
  }

  return overrideRuleIds.filter((ruleId) => context.activeRulesById.has(ruleId));
}

export function calculateAdditionalChargeForRoomNumber(
  roomNumber: string,
  context: RoomAdditionalChargeContext
): number {
  const roomRuleIds = resolveRoomRuleIds(roomNumber, context);

  if (roomRuleIds.length === 0) {
    return 0;
  }

  if (
    roomRuleIds.length === context.activeRuleIds.length &&
    roomRuleIds.every((ruleId, index) => ruleId === context.activeRuleIds[index])
  ) {
    return context.defaultChargePerRoom;
  }

  const amount = roomRuleIds.reduce((sum, ruleId) => {
    const rule = context.activeRulesById.get(ruleId);
    return sum + (rule?.amount ?? 0);
  }, 0);

  return normalizeChargeAmount(amount);
}

export function loadAdditionalChargePerRoom(): number {
  const settings = loadPropertySettings();
  return calculateAdditionalChargePerRoom(settings.additionalChargeRules);
}

export function loadAdditionalChargeForRoomNumber(roomNumber: string): number {
  const context = buildRoomAdditionalChargeContext();
  return calculateAdditionalChargeForRoomNumber(roomNumber, context);
}

export function calculateRoomAdditionalCharge(
  room: Room,
  context: RoomAdditionalChargeContext
): number {
  if (room.occupancy !== 'occupied') {
    return 0;
  }

  return calculateAdditionalChargeForRoomNumber(room.number, context);
}

export function countActiveAdditionalChargeRules(
  rules: AdditionalChargeRule[]
): number {
  return rules.filter((rule) => rule.isActive).length;
}

export function loadActiveAdditionalChargeRuleCount(): number {
  const settings = loadPropertySettings();
  return countActiveAdditionalChargeRules(settings.additionalChargeRules);
}
