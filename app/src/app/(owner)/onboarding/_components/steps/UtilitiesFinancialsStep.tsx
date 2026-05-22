'use client';

import { Droplet, Landmark, Receipt, Wallet, Zap } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import type { OnboardingFormData } from '@/lib/validation/ownerOnboarding';

export default function UtilitiesFinancialsStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<OnboardingFormData>();

  const fieldShellBase =
    'relative rounded-2xl bg-surface-container-lowest shadow-sm shadow-slate-200/50 ring-1 ring-outline-variant/40 focus-within:ring-2 focus-within:ring-blue-600/30 transition';

  const fieldShellError = 'ring-2 ring-error bg-error-container/30';

  const inputBase =
    'w-full h-14 bg-transparent pl-12 pr-4 text-base font-medium text-on-surface placeholder:text-outline-variant focus:outline-none';

  const selectBase =
    'w-full h-14 bg-transparent pl-4 pr-10 text-base font-medium text-on-surface focus:outline-none appearance-none';

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold text-blue-600">Step 3 of 4</p>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-on-surface">Utilities & Financials</h2>
          <p className="text-base text-on-surface-variant">
            Set your utility rates and payment details so invoices are ready from day one.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-2xl bg-surface-container-low p-6 shadow-sm shadow-slate-200/50 space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-on-surface">Utility Rates</h3>
            <p className="text-sm text-on-surface-variant">
              Define your electricity and water pricing so bills can be calculated automatically.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="electricityRate" className="text-sm font-semibold text-on-surface">
                Electricity Rate (THB / Unit)
              </label>
              <div className={`${fieldShellBase} ${errors.electricityRate ? fieldShellError : ''}`}>
                <Zap className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-outline" />
                <input
                  id="electricityRate"
                  type="number"
                  min={0}
                  className={inputBase}
                  placeholder="8.5"
                  {...register('electricityRate', {
                    valueAsNumber: true,
                    setValueAs: (value) => (value === '' ? undefined : Number(value)),
                  })}
                />
              </div>
              {errors.electricityRate && (
                <p className="text-xs font-semibold text-error">{errors.electricityRate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="waterRate" className="text-sm font-semibold text-on-surface">
                Water Rate (THB)
              </label>
              <div className={`${fieldShellBase} ${errors.waterRate ? fieldShellError : ''}`}>
                <Droplet className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-outline" />
                <input
                  id="waterRate"
                  type="number"
                  min={0}
                  className={inputBase}
                  placeholder="150"
                  {...register('waterRate', {
                    valueAsNumber: true,
                    setValueAs: (value) => (value === '' ? undefined : Number(value)),
                  })}
                />
              </div>
              {errors.waterRate && <p className="text-xs font-semibold text-error">{errors.waterRate.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="waterRateType" className="text-sm font-semibold text-on-surface">
              Water Rate Type
            </label>
            <div className={`${fieldShellBase} ${errors.waterRateType ? fieldShellError : ''}`}>
              <select id="waterRateType" className={selectBase} {...register('waterRateType')}>
                <option value="PER_UNIT">Per Unit</option>
                <option value="PER_PERSON">Per Person / Month</option>
                <option value="FIXED">Fixed Monthly</option>
              </select>
            </div>
            {errors.waterRateType && (
              <p className="text-xs font-semibold text-error">{errors.waterRateType.message}</p>
            )}
          </div>
        </section>

        <section className="rounded-2xl bg-surface-container-low p-6 shadow-sm shadow-slate-200/50 space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-on-surface">Payment Details</h3>
            <p className="text-sm text-on-surface-variant">
              These details will appear on invoices. You can update them any time later.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="bankName" className="text-sm font-semibold text-on-surface">
                Bank Name
              </label>
              <div className={fieldShellBase}>
                <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-outline" />
                <input
                  id="bankName"
                  type="text"
                  placeholder="Bangkok Bank"
                  className={inputBase}
                  {...register('bankName')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="bankAccount" className="text-sm font-semibold text-on-surface">
                Bank Account Number
              </label>
              <div className={fieldShellBase}>
                <Receipt className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-outline" />
                <input
                  id="bankAccount"
                  type="text"
                  placeholder="123-4-56789-0"
                  className={inputBase}
                  {...register('bankAccount')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="promptPay" className="text-sm font-semibold text-on-surface">
                PromptPay Number
              </label>
              <div className={fieldShellBase}>
                <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-outline" />
                <input
                  id="promptPay"
                  type="text"
                  placeholder="0xx-xxx-xxxx"
                  className={inputBase}
                  {...register('promptPay')}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
