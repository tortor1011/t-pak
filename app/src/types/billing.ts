import { BillingStatus } from './room';

export interface MeterReading {
  roomId: string;
  roomNumber: string;
  building: string;
  floor: number;
  electricity: {
    previous: number;
    current: number | null;
  };
  water: {
    previous: number;
    current: number | null;
  };
}

export interface BillItem {
  id: string;
  roomId: string;
  roomNumber: string;
  tenantName: string;
  month: string;
  year: number;
  baseRent: number;
  electricityUnits: number;
  electricityRate: number;
  electricityCost: number;
  waterUnits: number;
  waterRate: number;
  waterCost: number;
  additionalCharges: number;
  totalAmount: number;
  status: BillingStatus;
  dueDate: string;
  paidDate: string | null;
  slipUrl: string | null;
  meterReadDate: string;
}

export interface DebtItem {
  id: string;
  roomNumber: string;
  tenantName: string;
  totalOutstanding: number;
  monthsOverdue: number;
  lastReminder: string | null;
  phone: string;
}

export interface SlipVerification {
  id: string;
  roomNumber: string;
  tenantName: string;
  amount: number;
  slipUrl: string;
  uploadedAt: string;
  detectedAmount: number | null;
  detectedDate: string | null;
  isAmountMatch: boolean;
}
