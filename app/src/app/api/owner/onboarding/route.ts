import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { onboardingSchema } from '@/lib/validation/ownerOnboarding';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = session.user.role as string;
  if (role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const validation = onboardingSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: validation.error.flatten() },
      { status: 400 }
    );
  }

  const data = validation.data;

  try {
    const existingProperty = await prisma.property.findFirst({
      where: { ownerId: session.user.id },
      select: { id: true },
    });

    if (existingProperty) {
      return NextResponse.json(
        { error: 'Owner already completed onboarding' },
        { status: 409 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const property = await tx.property.create({
        data: {
          name: data.propertyName,
          address: data.address,
          phone: data.phone,
          ownerId: session.user.id,
        },
      });

      await tx.propertySettings.create({
        data: {
          propertyId: property.id,
          electricityRate: data.electricityRate ?? 8,
          waterRate: data.waterRate ?? 20,
          waterRateType: data.waterRateType,
          bankName: data.bankName ?? null,
          bankAccount: data.bankAccount ?? null,
          promptPay: data.promptPay ?? null,
        },
      });

      const createdRoomTypes: Array<{ clientId: string; id: string; baseRent: number }> = [];
      for (const type of data.roomTypes) {
        const created = await tx.roomType.create({
          data: {
            propertyId: property.id,
            name: type.name,
            baseRent: type.baseRent,
            securityDeposit: type.securityDeposit,
          },
        });

        createdRoomTypes.push({
          clientId: type.id,
          id: created.id,
          baseRent: type.baseRent,
        });
      }

      const roomTypeByClientId = new Map(
        createdRoomTypes.map((type) => [type.clientId, type])
      );
      const fallbackRoomType = createdRoomTypes[0];

      const roomsToCreate: Array<{
        number: string;
        floor: number;
        building: string;
        baseRent: number;
        propertyId: string;
        roomTypeId: string;
      }> = [];

      for (let floor = 1; floor <= data.floors; floor += 1) {
        const assignmentKey =
          data.roomTypeAssignment === 'ALL_SAME'
            ? data.floorAssignments?.all
            : data.floorAssignments?.[String(floor)];

        const assigned = roomTypeByClientId.get(assignmentKey ?? '') ?? fallbackRoomType;
        if (!assigned) continue;

        for (let index = 1; index <= data.roomsPerFloor; index += 1) {
          const roomNumber = String(floor * 100 + index);
          roomsToCreate.push({
            number: roomNumber,
            floor,
            building: 'A',
            baseRent: assigned.baseRent,
            propertyId: property.id,
            roomTypeId: assigned.id,
          });
        }
      }

      if (roomsToCreate.length > 0) {
        await tx.room.createMany({ data: roomsToCreate });
      }

      await tx.user.update({
        where: { id: session.user.id },
        data: { isOnboarded: true },
      });

      return {
        propertyId: property.id,
        roomCount: roomsToCreate.length,
      };
    });

    return NextResponse.json(
      { message: 'Onboarding completed', ...result },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to onboard owner:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}
