-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('active', 'former');

-- DropForeignKey
ALTER TABLE "tenants" DROP CONSTRAINT "tenants_roomId_fkey";

-- AlterTable
ALTER TABLE "bills" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "status" "TenantStatus" NOT NULL DEFAULT 'active',
ALTER COLUMN "roomId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
