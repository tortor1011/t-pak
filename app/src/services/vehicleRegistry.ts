import {
  VehicleRecord,
  VehicleRegistrationInput,
  VehicleSearchOptions,
  VehicleStatus,
  VehicleType,
  VehicleUpdateInput,
} from '@/types/vehicle';
import { MOCK_TENANTS, MOCK_VEHICLES } from '@/services/mockData';

const VEHICLE_REGISTRY_STORAGE_KEY = 'estate_clarity.vehicleRegistry.v1';
export const VEHICLE_REGISTRY_UPDATED_EVENT = 'estate_clarity.vehicle_registry_updated';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function isVehicleType(value: unknown): value is VehicleType {
  return value === 'car' || value === 'motorcycle' || value === 'other';
}

function isVehicleStatus(value: unknown): value is VehicleStatus {
  return value === 'verified' || value === 'unregistered' || value === 'inactive';
}

function isStringOrNull(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function sanitizeVehicleRecord(value: unknown): VehicleRecord | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const parsed = value as Record<string, unknown>;

  if (
    typeof parsed.id !== 'string' ||
    typeof parsed.tenantId !== 'string' ||
    typeof parsed.tenantName !== 'string' ||
    typeof parsed.roomNumber !== 'string' ||
    typeof parsed.plate !== 'string' ||
    !isVehicleType(parsed.vehicleType) ||
    !isVehicleStatus(parsed.status) ||
    typeof parsed.registeredAt !== 'string' ||
    typeof parsed.updatedAt !== 'string' ||
    !isStringOrNull(parsed.deactivatedAt)
  ) {
    return null;
  }

  return {
    id: parsed.id,
    tenantId: parsed.tenantId,
    tenantName: parsed.tenantName,
    roomNumber: parsed.roomNumber,
    plate: parsed.plate,
    vehicleType: parsed.vehicleType,
    status: parsed.status,
    registeredAt: parsed.registeredAt,
    updatedAt: parsed.updatedAt,
    deactivatedAt: parsed.deactivatedAt,
  };
}

function normalizePlate(value: string): string {
  return value.replace(/\s+/g, ' ').trim().toUpperCase();
}

function mergeBaseAndRuntimeVehicles(base: VehicleRecord[], runtime: VehicleRecord[]): VehicleRecord[] {
  const mergedById = new Map<string, VehicleRecord>();

  for (const vehicle of base) {
    mergedById.set(vehicle.id, {
      ...vehicle,
      plate: normalizePlate(vehicle.plate),
    });
  }

  for (const vehicle of runtime) {
    mergedById.set(vehicle.id, {
      ...vehicle,
      plate: normalizePlate(vehicle.plate),
    });
  }

  return Array.from(mergedById.values()).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  );
}

function loadRuntimeVehicleRegistry(): VehicleRecord[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(VEHICLE_REGISTRY_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => sanitizeVehicleRecord(item))
      .filter((item): item is VehicleRecord => item !== null);
  } catch {
    return [];
  }
}

function saveRuntimeVehicleRegistry(registry: VehicleRecord[]): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(
    VEHICLE_REGISTRY_STORAGE_KEY,
    JSON.stringify(registry)
  );
}

function dispatchVehicleRegistryUpdatedEvent(): void {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(VEHICLE_REGISTRY_UPDATED_EVENT));
}

function ensureRequired(value: string, label: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new Error(`${label} is required.`);
  }

  return normalized;
}

function createVehicleId(): string {
  return `vehicle-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function assertUniquePlate(registry: VehicleRecord[], plate: string, ignoreId?: string): void {
  const normalizedPlate = normalizePlate(plate);

  const duplicate = registry.some(
    (vehicle) =>
      vehicle.id !== ignoreId && normalizePlate(vehicle.plate) === normalizedPlate
  );

  if (duplicate) {
    throw new Error('Vehicle plate must be unique across the system.');
  }
}

function isTenantActive(tenantId: string): boolean {
  const tenant = MOCK_TENANTS.find((item) => item.id === tenantId);
  if (!tenant) {
    return false;
  }

  return tenant.moveOutDate === null;
}

function shouldIncludeVehicle(
  vehicle: VehicleRecord,
  options: VehicleSearchOptions
): boolean {
  const normalizedRoomNumber = options.roomNumber?.trim();
  if (normalizedRoomNumber && vehicle.roomNumber !== normalizedRoomNumber) {
    return false;
  }

  if (!options.activeTenantOnly) {
    return true;
  }

  if (vehicle.status === 'inactive') {
    return false;
  }

  return isTenantActive(vehicle.tenantId);
}

export function loadVehicleRegistry(
  baseRegistry: VehicleRecord[] = MOCK_VEHICLES
): VehicleRecord[] {
  return mergeBaseAndRuntimeVehicles(baseRegistry, loadRuntimeVehicleRegistry());
}

export function saveVehicleRegistry(registry: VehicleRecord[]): void {
  saveRuntimeVehicleRegistry(registry);
}

export function lookupVehicleByPlateExact(
  plate: string,
  options: VehicleSearchOptions = {}
): VehicleRecord | null {
  const normalizedPlate = normalizePlate(plate);

  if (!normalizedPlate) {
    return null;
  }

  return (
    loadVehicleRegistry().find(
      (vehicle) =>
        normalizePlate(vehicle.plate) === normalizedPlate &&
        shouldIncludeVehicle(vehicle, options)
    ) ?? null
  );
}

export function searchVehicleRegistry(
  query: string,
  options: VehicleSearchOptions = {}
): VehicleRecord[] {
  const normalizedQuery = normalizePlate(query);
  const registry = loadVehicleRegistry().filter((vehicle) =>
    shouldIncludeVehicle(vehicle, options)
  );

  if (!normalizedQuery) {
    return registry;
  }

  if (options.exactMatch) {
    return registry.filter(
      (vehicle) => normalizePlate(vehicle.plate) === normalizedQuery
    );
  }

  return registry.filter((vehicle) => {
    const normalizedPlate = normalizePlate(vehicle.plate);
    return (
      normalizedPlate.includes(normalizedQuery) ||
      vehicle.roomNumber.includes(normalizedQuery) ||
      vehicle.tenantName.toUpperCase().includes(normalizedQuery)
    );
  });
}

export function registerVehicleRecord(
  input: VehicleRegistrationInput
): VehicleRecord[] {
  const tenantId = ensureRequired(input.tenantId, 'tenantId');
  const tenantName = ensureRequired(input.tenantName, 'tenantName');
  const roomNumber = ensureRequired(input.roomNumber, 'roomNumber');
  const plate = normalizePlate(ensureRequired(input.plate, 'plate'));

  const registry = loadVehicleRegistry();
  assertUniquePlate(registry, plate);

  const nowIso = new Date().toISOString();
  const nextVehicle: VehicleRecord = {
    id: createVehicleId(),
    tenantId,
    tenantName,
    roomNumber,
    plate,
    vehicleType: input.vehicleType,
    status: input.status ?? 'verified',
    registeredAt: nowIso,
    updatedAt: nowIso,
    deactivatedAt: null,
  };

  const nextRegistry = [nextVehicle, ...registry];
  saveVehicleRegistry(nextRegistry);
  dispatchVehicleRegistryUpdatedEvent();
  return nextRegistry;
}

export function updateVehicleRecord(
  vehicleId: string,
  updates: VehicleUpdateInput
): VehicleRecord[] {
  const registry = loadVehicleRegistry();
  const target = registry.find((vehicle) => vehicle.id === vehicleId);

  if (!target) {
    throw new Error('Vehicle not found.');
  }

  const nextPlate = updates.plate ? normalizePlate(updates.plate) : target.plate;
  assertUniquePlate(registry, nextPlate, vehicleId);

  const nowIso = new Date().toISOString();
  const nextRegistry: VehicleRecord[] = registry.map(
    (vehicle): VehicleRecord => {
    if (vehicle.id !== vehicleId) {
      return vehicle;
    }

    return {
      ...vehicle,
      plate: nextPlate,
      vehicleType: updates.vehicleType ?? vehicle.vehicleType,
      status: updates.status ?? vehicle.status,
      updatedAt: nowIso,
      deactivatedAt: vehicle.deactivatedAt,
    };
    }
    );

  saveVehicleRegistry(nextRegistry);
  dispatchVehicleRegistryUpdatedEvent();
  return nextRegistry;
}

export function deactivateVehicleRecord(vehicleId: string): VehicleRecord[] {
  const nowIso = new Date().toISOString();
  const registry = loadVehicleRegistry();
  const hasTarget = registry.some((vehicle) => vehicle.id === vehicleId);

  if (!hasTarget) {
    throw new Error('Vehicle not found.');
  }

  const nextRegistry: VehicleRecord[] = registry.map(
    (vehicle): VehicleRecord => {
    if (vehicle.id !== vehicleId) {
      return vehicle;
    }

    return {
      ...vehicle,
      status: 'inactive',
      updatedAt: nowIso,
      deactivatedAt: nowIso,
    };
    }
    );

  saveVehicleRegistry(nextRegistry);
  dispatchVehicleRegistryUpdatedEvent();
  return nextRegistry;
}
