-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'TENANT');

-- CreateEnum
CREATE TYPE "RoomOccupancy" AS ENUM ('occupied', 'vacant', 'reserved');

-- CreateEnum
CREATE TYPE "BillingStatus" AS ENUM ('draft', 'pending', 'unpaid', 'pending_payment', 'paid', 'overdue', 'none');

-- CreateEnum
CREATE TYPE "ComplaintCategory" AS ENUM ('plumbing', 'electrical', 'furniture', 'cleaning', 'noise', 'appliance', 'other');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('new_ticket', 'in_progress', 'resolved');

-- CreateEnum
CREATE TYPE "DeliveryTaskStatus" AS ENUM ('pending', 'in_progress', 'delivered', 'returned');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('car', 'motorcycle', 'other');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('verified', 'unregistered', 'inactive');

-- CreateEnum
CREATE TYPE "WaterRateType" AS ENUM ('PER_UNIT', 'PER_PERSON', 'FIXED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('line', 'app');

-- CreateEnum
CREATE TYPE "NotificationCategory" AS ENUM ('parcel', 'billing', 'complaint', 'announcement');

-- CreateEnum
CREATE TYPE "SlipDecision" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'TENANT',
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "lineId" TEXT,
    "avatar" TEXT,
    "isOnboarded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_types" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "baseRent" DOUBLE PRECISION NOT NULL,
    "securityDeposit" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "room_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "floor" INTEGER NOT NULL,
    "building" TEXT NOT NULL DEFAULT 'A',
    "propertyId" TEXT,
    "roomTypeId" TEXT,
    "occupancy" "RoomOccupancy" NOT NULL DEFAULT 'vacant',
    "billingStatus" "BillingStatus" NOT NULL DEFAULT 'none',
    "baseRent" DOUBLE PRECISION NOT NULL,
    "currentBill" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "roomId" TEXT NOT NULL,
    "idCardUrl" TEXT,
    "contractDuration" TEXT NOT NULL DEFAULT '1-year',
    "moveInDate" TIMESTAMP(3) NOT NULL,
    "moveOutDate" TIMESTAMP(3),
    "contractEnd" TIMESTAMP(3) NOT NULL,
    "baseRent" DOUBLE PRECISION NOT NULL,
    "securityDeposit" DOUBLE PRECISION NOT NULL,
    "initialMeterElectricity" DOUBLE PRECISION NOT NULL,
    "initialMeterWater" DOUBLE PRECISION NOT NULL,
    "vehiclePlate" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "inviteCode" TEXT,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bills" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "baseRent" DOUBLE PRECISION NOT NULL,
    "electricityUnits" DOUBLE PRECISION NOT NULL,
    "electricityRate" DOUBLE PRECISION NOT NULL,
    "electricityCost" DOUBLE PRECISION NOT NULL,
    "waterUnits" DOUBLE PRECISION NOT NULL,
    "waterRate" DOUBLE PRECISION NOT NULL,
    "waterCost" DOUBLE PRECISION NOT NULL,
    "additionalCharges" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" "BillingStatus" NOT NULL DEFAULT 'unpaid',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidDate" TIMESTAMP(3),
    "slipUrl" TEXT,
    "meterReadDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meter_readings" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "electricityPrevious" DOUBLE PRECISION NOT NULL,
    "electricityCurrent" DOUBLE PRECISION,
    "waterPrevious" DOUBLE PRECISION NOT NULL,
    "waterCurrent" DOUBLE PRECISION,
    "readingDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meter_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slip_verifications" (
    "id" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "slipUrl" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "detectedAmount" DOUBLE PRECISION,
    "detectedDate" TIMESTAMP(3),
    "isAmountMatch" BOOLEAN NOT NULL DEFAULT false,
    "decision" "SlipDecision" NOT NULL DEFAULT 'pending',
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "slip_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaints" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "category" "ComplaintCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ComplaintStatus" NOT NULL DEFAULT 'new_ticket',
    "photoUrl" TEXT,
    "permissionToEnter" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "complaints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_tasks" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "tenantName" TEXT NOT NULL,
    "trackingNumber" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "courierName" TEXT,
    "status" "DeliveryTaskStatus" NOT NULL DEFAULT 'pending',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "proofPhotoUrl" TEXT,
    "deliveryNote" TEXT,
    "confirmationChecked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "plate" TEXT NOT NULL,
    "vehicleType" "VehicleType" NOT NULL DEFAULT 'car',
    "status" "VehicleStatus" NOT NULL DEFAULT 'unregistered',
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deactivatedAt" TIMESTAMP(3),

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_settings" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT,
    "electricityRate" DOUBLE PRECISION NOT NULL DEFAULT 8,
    "waterRate" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "waterRateType" "WaterRateType" NOT NULL DEFAULT 'PER_UNIT',
    "lateFee" DOUBLE PRECISION NOT NULL DEFAULT 200,
    "lateFeeDay" INTEGER NOT NULL DEFAULT 5,
    "bankName" TEXT,
    "bankAccount" TEXT,
    "promptPay" TEXT,
    "additionalChargeRules" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "imageUrl" TEXT,
    "targetAudience" TEXT NOT NULL DEFAULT 'all',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_number_key" ON "rooms"("number");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_userId_key" ON "tenants"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_roomId_key" ON "tenants"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_inviteCode_key" ON "tenants"("inviteCode");

-- CreateIndex
CREATE UNIQUE INDEX "slip_verifications_billId_key" ON "slip_verifications"("billId");

-- CreateIndex
CREATE UNIQUE INDEX "property_settings_propertyId_key" ON "property_settings"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_types" ADD CONSTRAINT "room_types_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "room_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meter_readings" ADD CONSTRAINT "meter_readings_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slip_verifications" ADD CONSTRAINT "slip_verifications_billId_fkey" FOREIGN KEY ("billId") REFERENCES "bills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_tasks" ADD CONSTRAINT "delivery_tasks_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_settings" ADD CONSTRAINT "property_settings_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
