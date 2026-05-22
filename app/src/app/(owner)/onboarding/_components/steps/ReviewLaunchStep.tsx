'use client';

import { useMemo } from 'react';
import {
  Building2,
  CheckCircle2,
  DoorClosed,
  Landmark,
  Rocket,
  Sparkles,
  Zap,
  Wallet,
} from 'lucide-react';
import type { OnboardingFormData } from '@/lib/validation/ownerOnboarding';

interface ReviewLaunchStepProps {
  formData: OnboardingFormData;
  onLaunch: () => void;
  isSubmitting: boolean;
  launched: boolean;
}

const WATER_RATE_LABEL: Record<string, string> = {
  PER_UNIT: 'Per Unit',
  PER_PERSON: 'Per Person / Month',
  FIXED: 'Fixed Monthly',
};

const formatCurrency = (value?: number) => {
  if (value === undefined || Number.isNaN(value)) return '—';
  return `THB ${value.toLocaleString('th-TH')}`;
};

export default function ReviewLaunchStep({ formData, onLaunch, isSubmitting, launched }: ReviewLaunchStepProps) {

  const summary = useMemo(() => {
    const totalRooms = Math.max(0, formData.floors) * Math.max(0, formData.roomsPerFloor);

    const rents = formData.roomTypes.map((type) => type.baseRent).filter((value) => !Number.isNaN(value));
    const minRent = rents.length ? Math.min(...rents) : undefined;
    const maxRent = rents.length ? Math.max(...rents) : undefined;

    const deposits = formData.roomTypes
      .map((type) => type.securityDeposit)
      .filter((value) => !Number.isNaN(value));
    const maxDeposit = deposits.length ? Math.max(...deposits) : undefined;

    const assignedTypeId = formData.floorAssignments?.all ?? null;
    const assignedType = formData.roomTypes.find((type) => type.id === assignedTypeId)?.name;

    return {
      totalRooms,
      minRent,
      maxRent,
      maxDeposit,
      assignedType,
    };
  }, [formData]);

  const launchLabel = isSubmitting ? 'Launching...' : launched ? 'Launched' : 'Launch T-PAK';

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold text-blue-600">Step 4 of 4</p>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-on-surface">Review & Launch</h2>
          <p className="text-base text-on-surface-variant">
            Confirm every detail before we generate your property structure in T-PAK.
          </p>
        </div>
      </div>

      <section className="rounded-2xl bg-surface-container-low p-6 shadow-sm shadow-slate-200/50">
        <div className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-blue-600">Launch Summary</p>
            <h3 className="text-2xl font-black text-on-surface">
              Creating {summary.totalRooms} rooms across {formData.floors} floors.
            </h3>
            <p className="text-sm text-on-surface-variant">
              Base rent ranges from {formatCurrency(summary.minRent)} to {formatCurrency(summary.maxRent)}.
              {summary.maxDeposit ? ` Maximum deposit: ${formatCurrency(summary.maxDeposit)}.` : ''}
            </p>
          </div>
          <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm shadow-slate-200/50 space-y-2">
            <div className="flex items-center gap-2 text-blue-600">
              <Sparkles className="h-4 w-4" />
              <p className="text-sm font-semibold">Ready to Launch</p>
            </div>
            <p className="text-sm text-on-surface-variant">
              We will generate your rooms and save the configuration once you launch.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-surface-container-low p-6 shadow-sm shadow-slate-200/50 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-600/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-on-surface">Property Details</p>
              <p className="text-xs text-on-surface-variant">Owner profile & contact</p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-on-surface-variant">
            <p className="text-base font-semibold text-on-surface">{formData.propertyName || '—'}</p>
            <p>{formData.address || '—'}</p>
            <p>Phone: {formData.phone || '—'}</p>
          </div>
        </section>

        <section className="rounded-2xl bg-surface-container-low p-6 shadow-sm shadow-slate-200/50 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-600/10 flex items-center justify-center">
              <DoorClosed className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-on-surface">Room Structure</p>
              <p className="text-xs text-on-surface-variant">Layout & types</p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-on-surface-variant">
            <p>
              Floors: <span className="text-on-surface font-semibold">{formData.floors}</span> • Rooms per floor:{' '}
              <span className="text-on-surface font-semibold">{formData.roomsPerFloor}</span>
            </p>
            <p>
              Room types: <span className="text-on-surface font-semibold">{formData.roomTypes.length}</span>
            </p>
            <p>
              Assignment:{' '}
              <span className="text-on-surface font-semibold">
                {formData.roomTypeAssignment === 'ALL_SAME'
                  ? `Single type (${summary.assignedType || 'Not selected'})`
                  : 'Multiple types by floor'}
              </span>
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-surface-container-low p-6 shadow-sm shadow-slate-200/50 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-600/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-on-surface">Utility Rates</p>
              <p className="text-xs text-on-surface-variant">Electricity & water</p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-on-surface-variant">
            <p>
              Electricity: <span className="text-on-surface font-semibold">{formatCurrency(formData.electricityRate)}</span>
            </p>
            <p>
              Water: <span className="text-on-surface font-semibold">{formatCurrency(formData.waterRate)}</span>
            </p>
            <p>
              Billing type:{' '}
              <span className="text-on-surface font-semibold">
                {WATER_RATE_LABEL[formData.waterRateType] ?? '—'}
              </span>
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-surface-container-low p-6 shadow-sm shadow-slate-200/50 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-600/10 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-on-surface">Payment Details</p>
              <p className="text-xs text-on-surface-variant">Bank or PromptPay</p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-on-surface-variant">
            <p>
              Bank: <span className="text-on-surface font-semibold">{formData.bankName || '—'}</span>
            </p>
            <p>
              Account: <span className="text-on-surface font-semibold">{formData.bankAccount || '—'}</span>
            </p>
            <p>
              PromptPay: <span className="text-on-surface font-semibold">{formData.promptPay || '—'}</span>
            </p>
          </div>
        </section>
      </div>

      <section className="rounded-2xl bg-surface-container-low p-6 shadow-sm shadow-slate-200/50 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-blue-600/10 flex items-center justify-center">
            {launched ? <CheckCircle2 className="h-6 w-6 text-blue-600" /> : <Landmark className="h-6 w-6 text-blue-600" />}
          </div>
          <div>
            <p className="text-base font-semibold text-on-surface">{launched ? 'Launch successful' : 'Launch T-PAK'}</p>
            <p className="text-sm text-on-surface-variant">
              {launched
                ? 'Your onboarding is saved. You can now manage tenants and billing.'
                : 'You can still edit settings later in the admin panel.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLaunch}
          disabled={isSubmitting || launched}
          aria-busy={isSubmitting}
          className="min-h-[56px] px-6 rounded-2xl btn-primary-gradient text-on-primary font-semibold inline-flex items-center gap-2 shadow-sm shadow-slate-200/50 disabled:opacity-70"
        >
          <Rocket className="h-5 w-5" />
          {launchLabel}
        </button>
      </section>
    </div>
  );
}
