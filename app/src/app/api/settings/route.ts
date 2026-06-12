import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/settings
 *
 * Returns property settings for the authenticated owner.
 * Creates a default record if none exists yet.
 */
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const property = await prisma.property.findFirst({
    where: { ownerId: session.user.id },
    include: { settings: true },
  });

  if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

  // Auto-create default settings if missing
  const settings = property.settings ?? await prisma.propertySettings.create({
    data: { propertyId: property.id },
  });

  return NextResponse.json({
    electricityRate: settings.electricityRate,
    waterRate: settings.waterRate,
    lateFee: settings.lateFee,
    lateFeeDay: settings.lateFeeDay,
    additionalChargeRules: settings.additionalChargeRules,
    updatedAt: settings.updatedAt.toISOString(),
  });
}

/**
 * PATCH /api/settings
 *
 * Updates property settings for the authenticated owner.
 * Body: { electricityRate, waterRate, lateFee, lateFeeDay, additionalChargeRules }
 */
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const { electricityRate, waterRate, lateFee, lateFeeDay, additionalChargeRules } = body;

  const property = await prisma.property.findFirst({
    where: { ownerId: session.user.id },
  });

  if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

  const settings = await prisma.propertySettings.upsert({
    where: { propertyId: property.id },
    create: {
      propertyId: property.id,
      electricityRate,
      waterRate,
      lateFee,
      lateFeeDay,
      additionalChargeRules,
    },
    update: {
      electricityRate,
      waterRate,
      lateFee,
      lateFeeDay,
      additionalChargeRules,
    },
  });

  return NextResponse.json({
    electricityRate: settings.electricityRate,
    waterRate: settings.waterRate,
    lateFee: settings.lateFee,
    lateFeeDay: settings.lateFeeDay,
    additionalChargeRules: settings.additionalChargeRules,
    updatedAt: settings.updatedAt.toISOString(),
  });
}
