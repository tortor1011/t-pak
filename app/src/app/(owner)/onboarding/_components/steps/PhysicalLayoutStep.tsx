'use client';

import { useEffect } from 'react';
import { Building2, DoorClosed, Layers, Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import type { OnboardingFormData } from '@/app/(owner)/onboarding/_components/OnboardingWizard';

const createRoomTypeId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `room-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export default function PhysicalLayoutStep() {
  const {
    register,
    control,
    formState: { errors },
    setValue,
    getValues,
  } = useFormContext<OnboardingFormData>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'roomTypes',
  });

  const floors = useWatch({ control, name: 'floors' }) ?? 1;
  const roomsPerFloor = useWatch({ control, name: 'roomsPerFloor' }) ?? 1;
  const roomTypes = useWatch({ control, name: 'roomTypes' }) ?? [];
  const roomTypeAssignment = useWatch({ control, name: 'roomTypeAssignment' }) ?? 'ALL_SAME';

  useEffect(() => {
    const current = (getValues('floorAssignments') ?? {}) as Record<string, string | null>;
    const defaultRoomType = roomTypes[0]?.id ?? null;

    if (roomTypeAssignment === 'PER_FLOOR') {
      const nextAssignments: Record<string, string | null> = { ...current };

      for (let floor = 1; floor <= floors; floor += 1) {
        const key = String(floor);
        if (!(key in nextAssignments)) {
          nextAssignments[key] = defaultRoomType;
        }
      }

      Object.keys(nextAssignments).forEach((key) => {
        if (key !== 'all' && Number(key) > floors) {
          delete nextAssignments[key];
        }
      });

      setValue('floorAssignments', nextAssignments);
    } else {
      setValue('floorAssignments', { all: current.all ?? defaultRoomType });
    }
  }, [floors, roomTypeAssignment, roomTypes, getValues, setValue]);

  const fieldShellBase =
    'relative rounded-2xl bg-surface-container-lowest shadow-sm shadow-slate-200/50 ring-1 ring-outline-variant/40 focus-within:ring-2 focus-within:ring-blue-600/30 transition';

  const fieldShellError = 'ring-2 ring-error bg-error-container/30';

  const inputBase =
    'w-full h-14 bg-transparent pl-12 pr-4 text-base font-medium text-on-surface placeholder:text-outline-variant focus:outline-none';

  const selectBase =
    'w-full h-14 bg-transparent pl-4 pr-10 text-base font-medium text-on-surface focus:outline-none appearance-none';

  const totalRooms = Math.max(0, floors) * Math.max(0, roomsPerFloor);

  const roomPreview = Array.from({ length: floors }, (_, index) => {
    const floor = index + 1;
    const start = floor * 100 + 1;
    const end = floor * 100 + roomsPerFloor;

    return { floor, start, end };
  });

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold text-blue-600">Step 2 of 4</p>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-on-surface">Physical Layout & Room Types</h2>
          <p className="text-base text-on-surface-variant">
            Define your room categories and how the building structure should generate rooms.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="rounded-2xl bg-surface-container-low p-6 shadow-sm shadow-slate-200/50 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-on-surface">Room Types</h3>
                <p className="text-sm text-on-surface-variant">
                  Add multiple room offerings with pricing to match your dormitory options.
                </p>
              </div>
              <button
                type="button"
                className="min-h-[56px] px-5 rounded-2xl btn-primary-gradient text-on-primary font-semibold inline-flex items-center gap-2 shadow-sm shadow-slate-200/50"
                onClick={() =>
                  append({
                    id: createRoomTypeId(),
                    name: '',
                    baseRent: 0,
                    securityDeposit: 0,
                  })
                }
              >
                <Plus className="h-5 w-5" />
                Add Room Type
              </button>
            </div>

            <div className="space-y-5">
              {fields.map((field, index) => {
                const nameError = errors.roomTypes?.[index]?.name?.message?.toString();
                const rentError = errors.roomTypes?.[index]?.baseRent?.message?.toString();
                const depositError = errors.roomTypes?.[index]?.securityDeposit?.message?.toString();

                return (
                  <div
                    key={field.id}
                    className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm shadow-slate-200/50 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-surface-container flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-on-surface">Room Type {index + 1}</p>
                          <p className="text-xs text-on-surface-variant">Pricing & configuration</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        className="min-h-[56px] px-4 rounded-2xl bg-surface-container text-on-surface-variant font-semibold inline-flex items-center gap-2 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-on-surface" htmlFor={`roomTypes.${index}.name`}>
                          Name
                        </label>
                        <div className={`${fieldShellBase} ${nameError ? fieldShellError : ''}`}>
                          <input
                            id={`roomTypes.${index}.name`}
                            placeholder="Standard Fan"
                            className={`${inputBase} pl-4`}
                            {...register(`roomTypes.${index}.name` as const)}
                          />
                        </div>
                        {nameError && <p className="text-xs font-semibold text-error">{nameError}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-on-surface" htmlFor={`roomTypes.${index}.baseRent`}>
                          Base Rent (THB)
                        </label>
                        <div className={`${fieldShellBase} ${rentError ? fieldShellError : ''}`}>
                          <input
                            id={`roomTypes.${index}.baseRent`}
                            type="number"
                            min={0}
                            className={`${inputBase} pl-4`}
                            {...register(`roomTypes.${index}.baseRent` as const, {
                              valueAsNumber: true,
                              setValueAs: (value) => (value === '' ? 0 : Number(value)),
                            })}
                          />
                        </div>
                        {rentError && <p className="text-xs font-semibold text-error">{rentError}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-on-surface" htmlFor={`roomTypes.${index}.securityDeposit`}>
                          Security Deposit (THB)
                        </label>
                        <div className={`${fieldShellBase} ${depositError ? fieldShellError : ''}`}>
                          <input
                            id={`roomTypes.${index}.securityDeposit`}
                            type="number"
                            min={0}
                            className={`${inputBase} pl-4`}
                            {...register(`roomTypes.${index}.securityDeposit` as const, {
                              valueAsNumber: true,
                              setValueAs: (value) => (value === '' ? 0 : Number(value)),
                            })}
                          />
                        </div>
                        {depositError && <p className="text-xs font-semibold text-error">{depositError}</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl bg-surface-container-low p-6 shadow-sm shadow-slate-200/50 space-y-6">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-on-surface">Building Structure</h3>
              <p className="text-sm text-on-surface-variant">
                Decide how many floors and rooms to generate for your property.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="floors" className="text-sm font-semibold text-on-surface">
                  Number of Floors
                </label>
                <div className={`${fieldShellBase} ${errors.floors ? fieldShellError : ''}`}>
                  <Layers className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-outline" />
                  <input
                    id="floors"
                    type="number"
                    min={1}
                    className={inputBase}
                    {...register('floors', {
                      valueAsNumber: true,
                      setValueAs: (value) => (value === '' ? 1 : Number(value)),
                    })}
                  />
                </div>
                {errors.floors && <p className="text-xs font-semibold text-error">{errors.floors.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="roomsPerFloor" className="text-sm font-semibold text-on-surface">
                  Rooms per Floor
                </label>
                <div className={`${fieldShellBase} ${errors.roomsPerFloor ? fieldShellError : ''}`}>
                  <DoorClosed className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-outline" />
                  <input
                    id="roomsPerFloor"
                    type="number"
                    min={1}
                    className={inputBase}
                    {...register('roomsPerFloor', {
                      valueAsNumber: true,
                      setValueAs: (value) => (value === '' ? 1 : Number(value)),
                    })}
                  />
                </div>
                {errors.roomsPerFloor && (
                  <p className="text-xs font-semibold text-error">{errors.roomsPerFloor.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-on-surface">Room Type Assignment</label>
              <div className={`${fieldShellBase} ${errors.roomTypeAssignment ? fieldShellError : ''}`}>
                <select
                  className={selectBase}
                  {...register('roomTypeAssignment')}
                  aria-invalid={Boolean(errors.roomTypeAssignment)}
                >
                  <option value="ALL_SAME">Apply one room type to all floors</option>
                  <option value="PER_FLOOR">Assign room types per floor</option>
                </select>
              </div>
            </div>

            {roomTypeAssignment === 'ALL_SAME' ? (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-on-surface">Building Room Type</label>
                <div className={`${fieldShellBase} ${errors.floorAssignments ? fieldShellError : ''}`}>
                  <select className={selectBase} {...register('floorAssignments.all')}>
                    {roomTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name || 'Unnamed Room Type'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-on-surface">Assign room types by floor</p>
                  <span className="text-xs text-on-surface-variant">{floors} floors</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {Array.from({ length: floors }, (_, index) => {
                    const floorNumber = index + 1;
                    return (
                      <div key={floorNumber} className="space-y-2">
                        <label className="text-xs font-semibold text-on-surface">
                          Floor {floorNumber}
                        </label>
                        <div className={fieldShellBase}>
                          <select className={selectBase} {...register(`floorAssignments.${floorNumber}` as const)}>
                            {roomTypes.map((type) => (
                              <option key={type.id} value={type.id}>
                                {type.name || 'Unnamed Room Type'}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl bg-surface-container-low p-6 shadow-sm shadow-slate-200/50 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-600/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">Room Preview</p>
                <p className="text-xs text-on-surface-variant">Auto-generated room numbers</p>
              </div>
            </div>

            <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm shadow-slate-200/50">
              <p className="text-sm font-semibold text-on-surface">Total Rooms</p>
              <p className="text-2xl font-black text-on-surface">{totalRooms}</p>
            </div>

            <div className="space-y-3">
              {roomPreview.map((preview) => (
                <div key={preview.floor} className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm shadow-slate-200/50">
                  <p className="text-xs font-semibold text-on-surface-variant">Floor {preview.floor}</p>
                  <p className="text-base font-semibold text-on-surface">
                    {preview.start}-{preview.end}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
