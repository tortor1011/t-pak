import { Room } from '@/types/room';
import { BillItem, DebtItem, SlipVerification, MeterReading } from '@/types/billing';
import { Tenant } from '@/types/tenant';
import { Complaint } from '@/types/complaint';
import { DeliveryTask } from '@/types/delivery';
import { VehicleRecord } from '@/types/vehicle';

/* ─── Rooms ─── */
export const MOCK_ROOMS: Room[] = [
  {
    id: 'r101', number: '101', floor: 1, building: 'A',
    occupancy: 'occupied', isConnectedWithDorm: true, billingStatus: 'paid',
    baseRent: 4500, currentBill: 4500,
    tenantId: 't1', tenantName: 'สมชาย ศรีสุข',
    tenantAvatar: null, amenities: ['AC', 'Furniture'],
  },
  {
    id: 'r102', number: '102', floor: 1, building: 'A',
    occupancy: 'occupied', isConnectedWithDorm: true, billingStatus: 'pending',
    baseRent: 4500, currentBill: 5200,
    tenantId: 't2', tenantName: 'สุรีย์ จันทร์ดี',
    tenantAvatar: null, amenities: ['AC', 'Furniture'],
  },
  {
    id: 'r103', number: '103', floor: 1, building: 'A',
    occupancy: 'occupied', isConnectedWithDorm: false, billingStatus: 'unpaid',
    baseRent: 4500, currentBill: 4500,
    tenantId: 't3', tenantName: 'ณัฐพล วงศ์ใหญ่',
    tenantAvatar: null, amenities: ['AC'],
  },
  {
    id: 'r104', number: '104', floor: 1, building: 'A',
    occupancy: 'occupied', isConnectedWithDorm: false, billingStatus: 'unpaid',
    baseRent: 4500, currentBill: 4500,
    tenantId: 't4', tenantName: 'แพรว ประเสริฐ',
    tenantAvatar: null, amenities: ['AC', 'Furniture'],
  },
  {
    id: 'r105', number: '105', floor: 1, building: 'A',
    occupancy: 'vacant', isConnectedWithDorm: false, billingStatus: 'paid',
    baseRent: 5500, currentBill: 0,
    tenantId: null, tenantName: null,
    tenantAvatar: null, amenities: ['AC', 'Furniture', 'Hot Water'],
  },
  {
    id: 'r201', number: '201', floor: 2, building: 'A',
    occupancy: 'occupied', isConnectedWithDorm: true, billingStatus: 'paid',
    baseRent: 4500, currentBill: 4800,
    tenantId: 't5', tenantName: 'วิชัย อำนาจ',
    tenantAvatar: null, amenities: ['AC', 'Furniture'],
  },
  {
    id: 'r202', number: '202', floor: 2, building: 'A',
    occupancy: 'occupied', isConnectedWithDorm: false, billingStatus: 'unpaid',
    baseRent: 5200, currentBill: 5200,
    tenantId: 't6', tenantName: 'ลลิตา มณี',
    tenantAvatar: null, amenities: ['AC', 'Furniture', 'Hot Water'],
  },
  {
    id: 'r203', number: '203', floor: 2, building: 'A',
    occupancy: 'occupied', isConnectedWithDorm: true, billingStatus: 'pending',
    baseRent: 4500, currentBill: 4700,
    tenantId: 't7', tenantName: 'ธนา สุขสันต์',
    tenantAvatar: null, amenities: ['AC'],
  },
  {
    id: 'r204', number: '204', floor: 2, building: 'A',
    occupancy: 'vacant', isConnectedWithDorm: false, billingStatus: 'paid',
    baseRent: 4500, currentBill: 0,
    tenantId: null, tenantName: null,
    tenantAvatar: null, amenities: ['AC', 'Furniture'],
  },
  {
    id: 'r205', number: '205', floor: 2, building: 'A',
    occupancy: 'occupied', isConnectedWithDorm: false, billingStatus: 'unpaid',
    baseRent: 4500, currentBill: 4800,
    tenantId: 't8', tenantName: 'Elena Rodriguez',
    tenantAvatar: null, amenities: ['AC', 'Furniture'],
  },
  {
    id: 'r301', number: '301', floor: 3, building: 'A',
    occupancy: 'occupied', isConnectedWithDorm: true, billingStatus: 'paid',
    baseRent: 5500, currentBill: 5800,
    tenantId: 't9', tenantName: 'สันติ คำแก้ว',
    tenantAvatar: null, amenities: ['AC', 'Furniture', 'Hot Water'],
  },
  {
    id: 'r304', number: '304', floor: 3, building: 'A',
    occupancy: 'occupied', isConnectedWithDorm: false, billingStatus: 'pending',
    baseRent: 4500, currentBill: 2500,
    tenantId: 't10', tenantName: 'พิมพ์ ชาญชัย',
    tenantAvatar: null, amenities: ['AC'],
  },
];

/* ─── Bills ─── */
export const MOCK_BILLS: BillItem[] = [
  {
    id: 'b1', roomId: 'r101', roomNumber: '101', tenantName: 'สมชาย ศรีสุข',
    month: 'April', year: 2026, baseRent: 4500,
    electricityUnits: 120, electricityRate: 8, electricityCost: 960,
    waterUnits: 8, waterRate: 20, waterCost: 160,
    additionalCharges: 0, totalAmount: 5620,
    status: 'paid', dueDate: '2026-04-05', paidDate: '2026-04-03',
    slipUrl: null, meterReadDate: '2026-04-01',
  },
  {
    id: 'b2', roomId: 'r102', roomNumber: '102', tenantName: 'สุรีย์ จันทร์ดี',
    month: 'April', year: 2026, baseRent: 4500,
    electricityUnits: 95, electricityRate: 8, electricityCost: 760,
    waterUnits: 6, waterRate: 20, waterCost: 120,
    additionalCharges: 0, totalAmount: 5380,
    status: 'pending', dueDate: '2026-04-05', paidDate: null,
    slipUrl: '/mock-slip.jpg', meterReadDate: '2026-04-01',
  },
  {
    id: 'b3', roomId: 'r103', roomNumber: '103', tenantName: 'ณัฐพล วงศ์ใหญ่',
    month: 'April', year: 2026, baseRent: 4500,
    electricityUnits: 80, electricityRate: 8, electricityCost: 640,
    waterUnits: 5, waterRate: 20, waterCost: 100,
    additionalCharges: 0, totalAmount: 5240,
    status: 'unpaid', dueDate: '2026-04-05', paidDate: null,
    slipUrl: null, meterReadDate: '2026-04-01',
  },
];

/* ─── Meter Readings ─── */
export const MOCK_METER_READINGS: MeterReading[] = [
  { roomId: 'r101', roomNumber: '101', building: 'A', floor: 1, electricity: { previous: 1234.5, current: null }, water: { previous: 456.2, current: null } },
  { roomId: 'r102', roomNumber: '102', building: 'A', floor: 1, electricity: { previous: 2345.0, current: null }, water: { previous: 567.0, current: null } },
  { roomId: 'r103', roomNumber: '103', building: 'A', floor: 1, electricity: { previous: 3456.5, current: null }, water: { previous: 678.5, current: null } },
  { roomId: 'r104', roomNumber: '104', building: 'A', floor: 1, electricity: { previous: 1890.0, current: null }, water: { previous: 234.0, current: null } },
];

/* ─── Debt Collection ─── */
export const MOCK_DEBTS: DebtItem[] = [
  { id: 'd1', roomNumber: '103', tenantName: 'ณัฐพล วงศ์ใหญ่', totalOutstanding: 5240, monthsOverdue: 1, lastReminder: '2026-04-10', phone: '081-234-5678' },
  { id: 'd2', roomNumber: '205', tenantName: 'Elena Rodriguez', totalOutstanding: 9600, monthsOverdue: 2, lastReminder: null, phone: '089-876-5432' },
  { id: 'd3', roomNumber: '202', tenantName: 'ลลิตา มณี', totalOutstanding: 5200, monthsOverdue: 1, lastReminder: '2026-04-12', phone: '086-111-2222' },
];

/* ─── Slip Verification Queue ─── */
export const MOCK_SLIPS: SlipVerification[] = [
  { id: 's1', roomNumber: '102', tenantName: 'สุรีย์ จันทร์ดี', amount: 5380, slipUrl: '/mock-slip-1.jpg', uploadedAt: '2026-04-15T10:30:00', detectedAmount: 5380, detectedDate: '2026-04-15', isAmountMatch: true },
  { id: 's2', roomNumber: '203', tenantName: 'ธนา สุขสันต์', amount: 4700, slipUrl: '/mock-slip-2.jpg', uploadedAt: '2026-04-15T14:20:00', detectedAmount: 4700, detectedDate: '2026-04-15', isAmountMatch: true },
  { id: 's3', roomNumber: '304', tenantName: 'พิมพ์ ชาญชัย', amount: 2500, slipUrl: '/mock-slip-3.jpg', uploadedAt: '2026-04-16T08:00:00', detectedAmount: 2500, detectedDate: '2026-04-16', isAmountMatch: true },
];

/* ─── Complaints ─── */
export const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: 'c1', roomNumber: '205', tenantName: 'Elena Rodriguez',
    category: 'appliance', title: 'AC not cooling',
    description: 'The air conditioner in my room has been blowing warm air for the past 2 days.',
    status: 'new', photoUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=200&h=200&fit=crop',
    permissionToEnter: true, createdAt: '2026-04-17T16:00:00', resolvedAt: null,
  },
  {
    id: 'c2', roomNumber: '104', tenantName: 'แพรว ประเสริฐ',
    category: 'plumbing', title: 'Faucet leaking',
    description: 'The kitchen faucet is leaking continuously. Wasting water.',
    status: 'in-progress', photoUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=200&h=200&fit=crop',
    permissionToEnter: true, createdAt: '2026-04-16T10:00:00', resolvedAt: null,
  },
  {
    id: 'c3', roomNumber: '301', tenantName: 'สันติ คำแก้ว',
    category: 'electrical', title: 'Lightbulb flickering',
    description: 'The main room light flickers every few seconds.',
    status: 'new', photoUrl: null,
    permissionToEnter: false, createdAt: '2026-04-17T17:45:00', resolvedAt: null,
  },
  {
    id: 'c4', roomNumber: '201', tenantName: 'วิชัย อำนาจ',
    category: 'plumbing', title: 'Water heater broken',
    description: 'No hot water coming out of the shower.',
    status: 'resolved', photoUrl: null,
    permissionToEnter: true, createdAt: '2026-04-10T09:00:00', resolvedAt: '2026-04-12T14:00:00',
  },
];

/* ─── Tenants ─── */
export const MOCK_TENANTS: Tenant[] = [
  {
    id: 't1', fullName: 'สมชาย ศรีสุข', phone: '081-234-5678', lineId: '@somchai',
    avatar: null, idCardUrl: null, roomId: 'r101', roomNumber: '101',
    contractDuration: '1-year', moveInDate: '2025-10-01', moveOutDate: null,
    contractEnd: '2026-09-30', baseRent: 4500, securityDeposit: 9000,
    initialMeterElectricity: 1000, initialMeterWater: 400, vehiclePlate: 'กข 1234',
  },
  {
    id: 't2', fullName: 'สุรีย์ จันทร์ดี', phone: '082-345-6789', lineId: '@suree',
    avatar: null, idCardUrl: null, roomId: 'r102', roomNumber: '102',
    contractDuration: '1-year', moveInDate: '2025-11-01', moveOutDate: null,
    contractEnd: '2026-10-31', baseRent: 4500, securityDeposit: 9000,
    initialMeterElectricity: 2000, initialMeterWater: 500, vehiclePlate: null,
  },
];

/* ─── Parcel Delivery Tasks ─── */
export const MOCK_DELIVERY_TASKS: DeliveryTask[] = [
  {
    id: 'p1',
    tenantName: 'พิมพ์ ชาญชัย',
    roomNumber: '304',
    trackingNumber: 'TH123456789',
    phone: '089-100-2200',
    courierName: null,
    status: 'pending',
    requestedAt: '2026-04-18T09:30:00.000Z',
    startedAt: null,
    deliveredAt: null,
    proofPhotoUrl: null,
    deliveryNote: null,
    confirmationChecked: false,
  },
  {
    id: 'p2',
    tenantName: 'สุรีย์ จันทร์ดี',
    roomNumber: '102',
    trackingNumber: 'SPX55663311',
    phone: '082-345-6789',
    courierName: null,
    status: 'in-progress',
    requestedAt: '2026-04-18T11:00:00.000Z',
    startedAt: '2026-04-18T11:20:00.000Z',
    deliveredAt: null,
    proofPhotoUrl: null,
    deliveryNote: null,
    confirmationChecked: false,
  },
  {
    id: 'p3',
    tenantName: 'สมชาย ศรีสุข',
    roomNumber: '101',
    trackingNumber: 'KEX99887766',
    phone: '081-234-5678',
    courierName: null,
    status: 'delivered',
    requestedAt: '2026-04-17T08:10:00.000Z',
    startedAt: '2026-04-17T08:45:00.000Z',
    deliveredAt: '2026-04-17T09:00:00.000Z',
    proofPhotoUrl: '/mock-parcel-proof-101.jpg',
    deliveryNote: 'Placed near the room door as requested.',
    confirmationChecked: true,
  },
];

/* ─── Vehicles ─── */
export const MOCK_VEHICLES: VehicleRecord[] = [
  {
    id: 'v1',
    tenantId: 't1',
    tenantName: 'สมชาย ศรีสุข',
    roomNumber: '101',
    plate: '1กข 1234 กทม',
    vehicleType: 'car',
    status: 'verified',
    registeredAt: '2026-03-01T08:00:00.000Z',
    updatedAt: '2026-03-01T08:00:00.000Z',
    deactivatedAt: null,
  },
  {
    id: 'v2',
    tenantId: 't1',
    tenantName: 'สมชาย ศรีสุข',
    roomNumber: '101',
    plate: '7ชพ 9876 สป',
    vehicleType: 'motorcycle',
    status: 'verified',
    registeredAt: '2026-03-05T08:00:00.000Z',
    updatedAt: '2026-03-05T08:00:00.000Z',
    deactivatedAt: null,
  },
  {
    id: 'v3',
    tenantId: 't2',
    tenantName: 'สุรีย์ จันทร์ดี',
    roomNumber: '102',
    plate: 'ขก 4455 เชียงใหม่',
    vehicleType: 'car',
    status: 'unregistered',
    registeredAt: '2026-03-10T08:00:00.000Z',
    updatedAt: '2026-03-10T08:00:00.000Z',
    deactivatedAt: null,
  },
  {
    id: 'v4',
    tenantId: 't8',
    tenantName: 'Elena Rodriguez',
    roomNumber: '205',
    plate: 'ศท 2211 กทม',
    vehicleType: 'car',
    status: 'verified',
    registeredAt: '2026-03-12T08:00:00.000Z',
    updatedAt: '2026-03-12T08:00:00.000Z',
    deactivatedAt: null,
  },
];

/* ─── Financial Summary ─── */
export const MOCK_FINANCIAL = {
  totalRevenue: 128400,
  pendingPayments: 12500,
  totalRooms: 12,
  occupiedRooms: 10,
  vacantRooms: 2,
  monthlyData: [
    { month: 'Nov', revenue: 98000, expenses: 45000 },
    { month: 'Dec', revenue: 105000, expenses: 48000 },
    { month: 'Jan', revenue: 112000, expenses: 42000 },
    { month: 'Feb', revenue: 118000, expenses: 50000 },
    { month: 'Mar', revenue: 125000, expenses: 46000 },
    { month: 'Apr', revenue: 128400, expenses: 47000 },
  ],
};
