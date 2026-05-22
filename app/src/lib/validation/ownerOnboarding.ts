import { z } from 'zod';

export const roomTypeSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Room type name is required'),
  baseRent: z.number().min(0, 'Base rent must be positive'),
  securityDeposit: z.number().min(0, 'Security deposit must be positive'),
});

export const onboardingSchema = z.object({
  // Step 1
  propertyName: z.string().min(2, 'Property Name is required'),
  address: z.string().min(5, 'Address is required'),
  phone: z.string().min(9, 'Valid phone number is required'),

  // Step 2
  roomTypes: z.array(roomTypeSchema).min(1, 'At least one room type is required'),
  floors: z.number().int().min(1, 'Must have at least 1 floor').max(50, 'Max 50 floors'),
  roomsPerFloor: z.number().int().min(1, 'Must have at least 1 room per floor').max(100, 'Max 100 rooms'),
  roomTypeAssignment: z.enum(['ALL_SAME', 'PER_FLOOR']),
  // Map of floor number to room type id
  floorAssignments: z.record(z.string(), z.string().nullable()).optional(),

  // Step 3
  electricityRate: z.number().min(0).optional(),
  waterRate: z.number().min(0).optional(),
  waterRateType: z.enum(['PER_UNIT', 'PER_PERSON', 'FIXED']),
  bankAccount: z.string().optional(),
  promptPay: z.string().optional(),
  bankName: z.string().optional(),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;
