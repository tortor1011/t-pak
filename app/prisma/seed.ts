import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Clean existing data (order matters for FK constraints) ───
  await prisma.slipVerification.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.meterReading.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.deliveryTask.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.room.deleteMany();
  await prisma.propertySettings.deleteMany();

  console.log('  ✓ Cleaned existing data');

  // ─── Rooms ───
  const rooms = await Promise.all([
    prisma.room.create({ data: { id: 'r101', number: '101', floor: 1, building: 'A', occupancy: 'occupied', billingStatus: 'paid', baseRent: 4500, currentBill: 4500, amenities: ['AC', 'Furniture'] } }),
    prisma.room.create({ data: { id: 'r102', number: '102', floor: 1, building: 'A', occupancy: 'occupied', billingStatus: 'pending', baseRent: 4500, currentBill: 5200, amenities: ['AC', 'Furniture'] } }),
    prisma.room.create({ data: { id: 'r103', number: '103', floor: 1, building: 'A', occupancy: 'occupied', billingStatus: 'unpaid', baseRent: 4500, currentBill: 4500, amenities: ['AC'] } }),
    prisma.room.create({ data: { id: 'r104', number: '104', floor: 1, building: 'A', occupancy: 'occupied', billingStatus: 'unpaid', baseRent: 4500, currentBill: 4500, amenities: ['AC', 'Furniture'] } }),
    prisma.room.create({ data: { id: 'r105', number: '105', floor: 1, building: 'A', occupancy: 'vacant', billingStatus: 'paid', baseRent: 5500, currentBill: 0, amenities: ['AC', 'Furniture', 'Hot Water'] } }),
    prisma.room.create({ data: { id: 'r201', number: '201', floor: 2, building: 'A', occupancy: 'occupied', billingStatus: 'paid', baseRent: 4500, currentBill: 4800, amenities: ['AC', 'Furniture'] } }),
    prisma.room.create({ data: { id: 'r202', number: '202', floor: 2, building: 'A', occupancy: 'occupied', billingStatus: 'unpaid', baseRent: 5200, currentBill: 5200, amenities: ['AC', 'Furniture', 'Hot Water'] } }),
    prisma.room.create({ data: { id: 'r203', number: '203', floor: 2, building: 'A', occupancy: 'occupied', billingStatus: 'pending', baseRent: 4500, currentBill: 4700, amenities: ['AC'] } }),
    prisma.room.create({ data: { id: 'r204', number: '204', floor: 2, building: 'A', occupancy: 'vacant', billingStatus: 'paid', baseRent: 4500, currentBill: 0, amenities: ['AC', 'Furniture'] } }),
    prisma.room.create({ data: { id: 'r205', number: '205', floor: 2, building: 'A', occupancy: 'occupied', billingStatus: 'unpaid', baseRent: 4500, currentBill: 4800, amenities: ['AC', 'Furniture'] } }),
    prisma.room.create({ data: { id: 'r301', number: '301', floor: 3, building: 'A', occupancy: 'occupied', billingStatus: 'paid', baseRent: 5500, currentBill: 5800, amenities: ['AC', 'Furniture', 'Hot Water'] } }),
    prisma.room.create({ data: { id: 'r304', number: '304', floor: 3, building: 'A', occupancy: 'occupied', billingStatus: 'pending', baseRent: 4500, currentBill: 2500, amenities: ['AC'] } }),
  ]);
  console.log(`  ✓ Created ${rooms.length} rooms`);

  // ─── Users (Admin + Tenants) ───
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const tenantPasswordHash = await bcrypt.hash('tenant123', 10);

  const admin = await prisma.user.create({
    data: {
      id: 'u-admin',
      email: 'admin@tpak.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      fullName: 'ผู้ดูแลระบบ',
      phone: '080-000-0000',
    },
  });

  const users = await Promise.all([
    prisma.user.create({ data: { id: 'u1', email: 'somchai@tenant.com', passwordHash: tenantPasswordHash, role: 'TENANT', fullName: 'สมชาย ศรีสุข', phone: '081-234-5678', lineId: '@somchai' } }),
    prisma.user.create({ data: { id: 'u2', email: 'suree@tenant.com', passwordHash: tenantPasswordHash, role: 'TENANT', fullName: 'สุรีย์ จันทร์ดี', phone: '082-345-6789', lineId: '@suree' } }),
    prisma.user.create({ data: { id: 'u3', email: 'nattapol@tenant.com', passwordHash: tenantPasswordHash, role: 'TENANT', fullName: 'ณัฐพล วงศ์ใหญ่', phone: '081-234-5678' } }),
    prisma.user.create({ data: { id: 'u4', email: 'praew@tenant.com', passwordHash: tenantPasswordHash, role: 'TENANT', fullName: 'แพรว ประเสริฐ', phone: '083-456-7890' } }),
    prisma.user.create({ data: { id: 'u5', email: 'wichai@tenant.com', passwordHash: tenantPasswordHash, role: 'TENANT', fullName: 'วิชัย อำนาจ', phone: '084-567-8901' } }),
    prisma.user.create({ data: { id: 'u6', email: 'lalita@tenant.com', passwordHash: tenantPasswordHash, role: 'TENANT', fullName: 'ลลิตา มณี', phone: '085-678-9012' } }),
    prisma.user.create({ data: { id: 'u7', email: 'thana@tenant.com', passwordHash: tenantPasswordHash, role: 'TENANT', fullName: 'ธนา สุขสันต์', phone: '086-789-0123' } }),
    prisma.user.create({ data: { id: 'u8', email: 'elena@tenant.com', passwordHash: tenantPasswordHash, role: 'TENANT', fullName: 'Elena Rodriguez', phone: '089-876-5432' } }),
    prisma.user.create({ data: { id: 'u9', email: 'santi@tenant.com', passwordHash: tenantPasswordHash, role: 'TENANT', fullName: 'สันติ คำแก้ว', phone: '087-890-1234' } }),
    prisma.user.create({ data: { id: 'u10', email: 'pim@tenant.com', passwordHash: tenantPasswordHash, role: 'TENANT', fullName: 'พิมพ์ ชาญชัย', phone: '089-100-2200' } }),
  ]);
  console.log(`  ✓ Created 1 admin + ${users.length} tenant users`);

  // ─── Tenants ───
  const tenants = await Promise.all([
    prisma.tenant.create({ data: { id: 't1', userId: 'u1', roomId: 'r101', contractDuration: '1-year', moveInDate: new Date('2025-10-01'), contractEnd: new Date('2026-09-30'), baseRent: 4500, securityDeposit: 9000, initialMeterElectricity: 1000, initialMeterWater: 400, vehiclePlate: 'กข 1234' } }),
    prisma.tenant.create({ data: { id: 't2', userId: 'u2', roomId: 'r102', contractDuration: '1-year', moveInDate: new Date('2025-11-01'), contractEnd: new Date('2026-10-31'), baseRent: 4500, securityDeposit: 9000, initialMeterElectricity: 2000, initialMeterWater: 500 } }),
    prisma.tenant.create({ data: { id: 't3', userId: 'u3', roomId: 'r103', contractDuration: '6-months', moveInDate: new Date('2026-01-01'), contractEnd: new Date('2026-06-30'), baseRent: 4500, securityDeposit: 9000, initialMeterElectricity: 3000, initialMeterWater: 600 } }),
    prisma.tenant.create({ data: { id: 't4', userId: 'u4', roomId: 'r104', contractDuration: '1-year', moveInDate: new Date('2025-12-01'), contractEnd: new Date('2026-11-30'), baseRent: 4500, securityDeposit: 9000, initialMeterElectricity: 1500, initialMeterWater: 200 } }),
    prisma.tenant.create({ data: { id: 't5', userId: 'u5', roomId: 'r201', contractDuration: '1-year', moveInDate: new Date('2025-09-01'), contractEnd: new Date('2026-08-31'), baseRent: 4500, securityDeposit: 9000, initialMeterElectricity: 1800, initialMeterWater: 350 } }),
    prisma.tenant.create({ data: { id: 't6', userId: 'u6', roomId: 'r202', contractDuration: 'monthly', moveInDate: new Date('2026-02-01'), contractEnd: new Date('2026-05-01'), baseRent: 5200, securityDeposit: 10400, initialMeterElectricity: 2200, initialMeterWater: 450 } }),
    prisma.tenant.create({ data: { id: 't7', userId: 'u7', roomId: 'r203', contractDuration: '1-year', moveInDate: new Date('2025-10-15'), contractEnd: new Date('2026-10-14'), baseRent: 4500, securityDeposit: 9000, initialMeterElectricity: 2500, initialMeterWater: 500 } }),
    prisma.tenant.create({ data: { id: 't8', userId: 'u8', roomId: 'r205', contractDuration: '1-year', moveInDate: new Date('2025-08-01'), contractEnd: new Date('2026-07-31'), baseRent: 4500, securityDeposit: 9000, initialMeterElectricity: 1700, initialMeterWater: 300 } }),
    prisma.tenant.create({ data: { id: 't9', userId: 'u9', roomId: 'r301', contractDuration: '1-year', moveInDate: new Date('2025-07-01'), contractEnd: new Date('2026-06-30'), baseRent: 5500, securityDeposit: 11000, initialMeterElectricity: 3500, initialMeterWater: 700 } }),
    prisma.tenant.create({ data: { id: 't10', userId: 'u10', roomId: 'r304', contractDuration: '6-months', moveInDate: new Date('2026-01-15'), contractEnd: new Date('2026-07-14'), baseRent: 4500, securityDeposit: 9000, initialMeterElectricity: 1900, initialMeterWater: 380 } }),
  ]);
  console.log(`  ✓ Created ${tenants.length} tenants`);

  // ─── Bills ───
  const bills = await Promise.all([
    prisma.bill.create({ data: { id: 'b1', roomId: 'r101', month: 'April', year: 2026, baseRent: 4500, electricityUnits: 120, electricityRate: 8, electricityCost: 960, waterUnits: 8, waterRate: 20, waterCost: 160, additionalCharges: 0, totalAmount: 5620, status: 'paid', dueDate: new Date('2026-04-05'), paidDate: new Date('2026-04-03'), meterReadDate: new Date('2026-04-01') } }),
    prisma.bill.create({ data: { id: 'b2', roomId: 'r102', month: 'April', year: 2026, baseRent: 4500, electricityUnits: 95, electricityRate: 8, electricityCost: 760, waterUnits: 6, waterRate: 20, waterCost: 120, additionalCharges: 0, totalAmount: 5380, status: 'pending', dueDate: new Date('2026-04-05'), slipUrl: '/mock-slip.jpg', meterReadDate: new Date('2026-04-01') } }),
    prisma.bill.create({ data: { id: 'b3', roomId: 'r103', month: 'April', year: 2026, baseRent: 4500, electricityUnits: 80, electricityRate: 8, electricityCost: 640, waterUnits: 5, waterRate: 20, waterCost: 100, additionalCharges: 0, totalAmount: 5240, status: 'unpaid', dueDate: new Date('2026-04-05'), meterReadDate: new Date('2026-04-01') } }),
  ]);
  console.log(`  ✓ Created ${bills.length} bills`);

  // ─── Meter Readings ───
  const meterReadings = await Promise.all([
    prisma.meterReading.create({ data: { roomId: 'r101', electricityPrevious: 1234.5, electricityCurrent: null, waterPrevious: 456.2, waterCurrent: null } }),
    prisma.meterReading.create({ data: { roomId: 'r102', electricityPrevious: 2345.0, electricityCurrent: null, waterPrevious: 567.0, waterCurrent: null } }),
    prisma.meterReading.create({ data: { roomId: 'r103', electricityPrevious: 3456.5, electricityCurrent: null, waterPrevious: 678.5, waterCurrent: null } }),
    prisma.meterReading.create({ data: { roomId: 'r104', electricityPrevious: 1890.0, electricityCurrent: null, waterPrevious: 234.0, waterCurrent: null } }),
  ]);
  console.log(`  ✓ Created ${meterReadings.length} meter readings`);

  // ─── Slip Verifications ───
  const slips = await Promise.all([
    prisma.slipVerification.create({ data: { id: 's1', billId: 'b2', slipUrl: '/mock-slip-1.jpg', uploadedAt: new Date('2026-04-15T10:30:00'), detectedAmount: 5380, detectedDate: new Date('2026-04-15'), isAmountMatch: true, decision: 'pending' } }),
  ]);
  console.log(`  ✓ Created ${slips.length} slip verifications`);

  // ─── Complaints ───
  const complaints = await Promise.all([
    prisma.complaint.create({ data: { id: 'c1', roomId: 'r205', category: 'appliance', title: 'AC not cooling', description: 'The air conditioner in my room has been blowing warm air for the past 2 days.', status: 'new_ticket', photoUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=200&h=200&fit=crop', permissionToEnter: true, createdAt: new Date('2026-04-17T16:00:00') } }),
    prisma.complaint.create({ data: { id: 'c2', roomId: 'r104', category: 'plumbing', title: 'Faucet leaking', description: 'The kitchen faucet is leaking continuously. Wasting water.', status: 'in_progress', photoUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=200&h=200&fit=crop', permissionToEnter: true, createdAt: new Date('2026-04-16T10:00:00') } }),
    prisma.complaint.create({ data: { id: 'c3', roomId: 'r301', category: 'electrical', title: 'Lightbulb flickering', description: 'The main room light flickers every few seconds.', status: 'new_ticket', permissionToEnter: false, createdAt: new Date('2026-04-17T17:45:00') } }),
    prisma.complaint.create({ data: { id: 'c4', roomId: 'r201', category: 'plumbing', title: 'Water heater broken', description: 'No hot water coming out of the shower.', status: 'resolved', permissionToEnter: true, createdAt: new Date('2026-04-10T09:00:00'), resolvedAt: new Date('2026-04-12T14:00:00') } }),
  ]);
  console.log(`  ✓ Created ${complaints.length} complaints`);

  // ─── Delivery Tasks ───
  const deliveries = await Promise.all([
    prisma.deliveryTask.create({ data: { id: 'p1', roomId: 'r304', tenantName: 'พิมพ์ ชาญชัย', trackingNumber: 'TH123456789', phone: '089-100-2200', status: 'pending', requestedAt: new Date('2026-04-18T09:30:00.000Z') } }),
    prisma.deliveryTask.create({ data: { id: 'p2', roomId: 'r102', tenantName: 'สุรีย์ จันทร์ดี', trackingNumber: 'SPX55663311', phone: '082-345-6789', status: 'in_progress', requestedAt: new Date('2026-04-18T11:00:00.000Z'), startedAt: new Date('2026-04-18T11:20:00.000Z') } }),
    prisma.deliveryTask.create({ data: { id: 'p3', roomId: 'r101', tenantName: 'สมชาย ศรีสุข', trackingNumber: 'KEX99887766', phone: '081-234-5678', status: 'delivered', requestedAt: new Date('2026-04-17T08:10:00.000Z'), startedAt: new Date('2026-04-17T08:45:00.000Z'), deliveredAt: new Date('2026-04-17T09:00:00.000Z'), proofPhotoUrl: '/mock-parcel-proof-101.jpg', deliveryNote: 'Placed near the room door as requested.', confirmationChecked: true } }),
  ]);
  console.log(`  ✓ Created ${deliveries.length} delivery tasks`);

  // ─── Vehicles ───
  const vehicles = await Promise.all([
    prisma.vehicle.create({ data: { id: 'v1', tenantId: 't1', roomId: 'r101', plate: '1กข 1234 กทม', vehicleType: 'car', status: 'verified', registeredAt: new Date('2026-03-01T08:00:00.000Z') } }),
    prisma.vehicle.create({ data: { id: 'v2', tenantId: 't1', roomId: 'r101', plate: '7ชพ 9876 สป', vehicleType: 'motorcycle', status: 'verified', registeredAt: new Date('2026-03-05T08:00:00.000Z') } }),
    prisma.vehicle.create({ data: { id: 'v3', tenantId: 't2', roomId: 'r102', plate: 'ขก 4455 เชียงใหม่', vehicleType: 'car', status: 'unregistered', registeredAt: new Date('2026-03-10T08:00:00.000Z') } }),
    prisma.vehicle.create({ data: { id: 'v4', tenantId: 't8', roomId: 'r205', plate: 'ศท 2211 กทม', vehicleType: 'car', status: 'verified', registeredAt: new Date('2026-03-12T08:00:00.000Z') } }),
  ]);
  console.log(`  ✓ Created ${vehicles.length} vehicles`);

  // ─── Property Settings ───
  await prisma.propertySettings.create({
    data: {
      electricityRate: 8,
      waterRate: 20,
      lateFee: 200,
      lateFeeDay: 5,
      additionalChargeRules: [],
    },
  });
  console.log('  ✓ Created default property settings');

  console.log('\n✅ Seed completed successfully!');
  console.log('   Admin login: admin@tpak.com / admin123');
  console.log('   Tenant login: somchai@tenant.com / tenant123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
