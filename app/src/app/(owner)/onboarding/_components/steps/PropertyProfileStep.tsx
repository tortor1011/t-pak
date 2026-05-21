'use client';

import { Building2, MapPin, Phone } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import type { OnboardingFormData } from '@/app/(owner)/onboarding/_components/OnboardingWizard';

export default function PropertyProfileStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<OnboardingFormData>();

  const propertyNameError = errors.propertyName?.message?.toString();
  const addressError = errors.address?.message?.toString();
  const phoneError = errors.phone?.message?.toString();

  const fieldShellBase =
    'relative rounded-2xl bg-surface-container-lowest shadow-sm shadow-slate-200/50 ring-1 ring-outline-variant/40 focus-within:ring-2 focus-within:ring-blue-600/30 transition';

  const fieldShellError = 'ring-2 ring-error bg-error-container/30';

  const inputBase =
    'w-full h-14 bg-transparent pl-12 pr-4 text-base font-medium text-on-surface placeholder:text-outline-variant focus:outline-none';

  const textareaBase =
    'w-full min-h-[140px] bg-transparent pl-12 pr-4 pt-4 pb-4 text-base font-medium text-on-surface placeholder:text-outline-variant focus:outline-none resize-none';

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold text-blue-600">Step 1 of 4</p>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-on-surface">Property Profile</h2>
          <p className="text-base text-on-surface-variant">
            Tell us about your dormitory so we can tailor the room layout and billing settings.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="space-y-2">
          <label htmlFor="propertyName" className="text-base font-semibold text-on-surface">
            Property Name
          </label>
          <div className={`${fieldShellBase} ${propertyNameError ? fieldShellError : ''}`}>
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-outline" />
            <input
              id="propertyName"
              type="text"
              placeholder="Estate Clarity Residences"
              className={inputBase}
              aria-invalid={Boolean(propertyNameError)}
              aria-describedby={propertyNameError ? 'propertyName-error' : undefined}
              {...register('propertyName')}
            />
          </div>
          {propertyNameError && (
            <p id="propertyName-error" className="text-sm font-semibold text-error">
              {propertyNameError}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="address" className="text-base font-semibold text-on-surface">
            Address
          </label>
          <div className={`${fieldShellBase} ${addressError ? fieldShellError : ''}`}>
            <MapPin className="absolute left-4 top-5 h-5 w-5 text-outline" />
            <textarea
              id="address"
              placeholder="123 ถนนสุขุมวิท, เขตวัฒนา, กรุงเทพฯ"
              className={textareaBase}
              aria-invalid={Boolean(addressError)}
              aria-describedby={addressError ? 'address-error' : undefined}
              {...register('address')}
            />
          </div>
          {addressError && (
            <p id="address-error" className="text-sm font-semibold text-error">
              {addressError}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-base font-semibold text-on-surface">
            Central Phone Number
          </label>
          <div className={`${fieldShellBase} ${phoneError ? fieldShellError : ''}`}>
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-outline" />
            <input
              id="phone"
              type="tel"
              placeholder="02-123-4567"
              className={inputBase}
              aria-invalid={Boolean(phoneError)}
              aria-describedby={phoneError ? 'phone-error' : undefined}
              {...register('phone')}
            />
          </div>
          {phoneError && (
            <p id="phone-error" className="text-sm font-semibold text-error">
              {phoneError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
