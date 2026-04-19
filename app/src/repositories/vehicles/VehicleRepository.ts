import type { Result } from '@/repositories/common/Result';
import type {
  VehicleRecord,
  VehicleRegistrationInput,
  VehicleSearchOptions,
  VehicleUpdateInput,
} from '@/types/vehicle';

export interface VehicleRepository {
  listVehicles(options?: VehicleSearchOptions): Result<VehicleRecord[]>;
  searchVehicles(
    query: string,
    options?: VehicleSearchOptions
  ): Result<VehicleRecord[]>;
  lookupByPlateExact(
    plate: string,
    options?: VehicleSearchOptions
  ): Result<VehicleRecord | null>;
  registerVehicle(payload: VehicleRegistrationInput): Result<VehicleRecord[]>;
  updateVehicle(
    vehicleId: string,
    updates: VehicleUpdateInput
  ): Result<VehicleRecord[]>;
  deactivateVehicle(vehicleId: string): Result<VehicleRecord[]>;
}
