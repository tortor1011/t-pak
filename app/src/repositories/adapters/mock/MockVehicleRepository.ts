import { err, ok, type Result } from '@/repositories/common/Result';
import type { VehicleRepository } from '@/repositories/vehicles/VehicleRepository';
import {
  deactivateVehicleRecord,
  lookupVehicleByPlateExact,
  registerVehicleRecord,
  searchVehicleRegistry,
  updateVehicleRecord,
} from '@/services/vehicleRegistry';
import type {
  VehicleRecord,
  VehicleRegistrationInput,
  VehicleSearchOptions,
  VehicleUpdateInput,
} from '@/types/vehicle';

function mapVehicleError(error: unknown): {
  code: 'NOT_FOUND' | 'VALIDATION_ERROR' | 'CONFLICT' | 'UNKNOWN_ERROR';
  message: string;
  details?: unknown;
} {
  if (error instanceof Error) {
    const message = error.message;
    const normalized = message.toLowerCase();

    if (normalized.includes('not found')) {
      return { code: 'NOT_FOUND', message, details: error };
    }

    if (normalized.includes('required')) {
      return { code: 'VALIDATION_ERROR', message, details: error };
    }

    if (normalized.includes('unique') || normalized.includes('duplicate')) {
      return { code: 'CONFLICT', message, details: error };
    }

    return { code: 'UNKNOWN_ERROR', message, details: error };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'Unexpected vehicle repository error.',
    details: error,
  };
}

export class MockVehicleRepository implements VehicleRepository {
  listVehicles(options: VehicleSearchOptions = {}): Result<VehicleRecord[]> {
    try {
      const vehicles = searchVehicleRegistry('', options);
      return ok(vehicles);
    } catch (error) {
      return err({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to load vehicles.',
        details: error,
      });
    }
  }

  searchVehicles(
    query: string,
    options: VehicleSearchOptions = {}
  ): Result<VehicleRecord[]> {
    try {
      return ok(searchVehicleRegistry(query, options));
    } catch (error) {
      return err({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to search vehicles.',
        details: error,
      });
    }
  }

  lookupByPlateExact(
    plate: string,
    options: VehicleSearchOptions = {}
  ): Result<VehicleRecord | null> {
    try {
      return ok(lookupVehicleByPlateExact(plate, options));
    } catch (error) {
      return err({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to lookup vehicle by plate.',
        details: error,
      });
    }
  }

  registerVehicle(payload: VehicleRegistrationInput): Result<VehicleRecord[]> {
    try {
      const registry = registerVehicleRecord(payload);
      return ok(registry);
    } catch (error) {
      const mapped = mapVehicleError(error);
      return err(mapped);
    }
  }

  updateVehicle(
    vehicleId: string,
    updates: VehicleUpdateInput
  ): Result<VehicleRecord[]> {
    try {
      const registry = updateVehicleRecord(vehicleId, updates);
      return ok(registry);
    } catch (error) {
      const mapped = mapVehicleError(error);
      return err(mapped);
    }
  }

  deactivateVehicle(vehicleId: string): Result<VehicleRecord[]> {
    try {
      const registry = deactivateVehicleRecord(vehicleId);
      return ok(registry);
    } catch (error) {
      const mapped = mapVehicleError(error);
      return err(mapped);
    }
  }
}
