'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { AlertTriangle } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingSchema, type OnboardingFormData } from '@/lib/validation/ownerOnboarding';
import StepIndicator from './StepIndicator';
import PropertyProfileStep from './steps/PropertyProfileStep';
import PhysicalLayoutStep from './steps/PhysicalLayoutStep';
import UtilitiesFinancialsStep from './steps/UtilitiesFinancialsStep';
import ReviewLaunchStep from './steps/ReviewLaunchStep';

const STEPS = ['Property Profile', 'Physical Layout', 'Utilities', 'Review & Launch'];

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const [toast, setToast] = useState<{ tone: 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [launchComplete, setLaunchComplete] = useState(false);

  const methods = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      propertyName: '',
      address: '',
      phone: '',
      roomTypes: [{ id: '1', name: 'Standard', baseRent: 3500, securityDeposit: 7000 }],
      floors: 1,
      roomsPerFloor: 10,
      roomTypeAssignment: 'ALL_SAME',
      floorAssignments: {},
      waterRateType: 'PER_UNIT',
    },
    mode: 'onTouched',
  });

  const formValues = methods.watch();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const nextStep = async () => {
    const fieldsToValidate: any[] = [];
    if (currentStep === 0) fieldsToValidate.push('propertyName', 'address', 'phone');
    if (currentStep === 1) {
      fieldsToValidate.push('roomTypes', 'floors', 'roomsPerFloor', 'roomTypeAssignment', 'floorAssignments');
    }

    if (fieldsToValidate.length > 0) {
      const isStepValid = await methods.trigger(fieldsToValidate as any);
      if (!isStepValid) return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleLaunch = methods.handleSubmit(async (data) => {
    if (isSubmitting || launchComplete) return;

    setIsSubmitting(true);
    setToast(null);

    try {
      const response = await fetch('/api/owner/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        let message = 'Failed to launch onboarding.';
        try {
          const payload = await response.json();
          message = payload?.error ?? payload?.message ?? message;
        } catch {
          message = 'Failed to launch onboarding.';
        }

        setToast({ tone: 'error', message });
        setIsSubmitting(false);
        return;
      }

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#004ac6', '#2563eb', '#7cf994', '#dbe1ff'],
      });

      setTimeout(() => {
        confetti({
          particleCount: 60,
          spread: 120,
          origin: { y: 0.6 },
          colors: ['#004ac6', '#2563eb', '#dbe1ff'],
        });
      }, 300);

      setLaunchComplete(true);
      setIsSubmitting(false);

      setTimeout(() => {
        router.push('/dashboard');
      }, 1200);
    } catch (error) {
      setToast({ tone: 'error', message: 'Failed to launch onboarding. Please try again.' });
      setIsSubmitting(false);
    }
  });

  return (
    <FormProvider {...methods}>
      {toast && (
        <div className="fixed right-6 top-6 z-50 w-[320px] rounded-2xl bg-surface-container-lowest p-4 shadow-[0_20px_50px_rgba(18,28,40,0.08)]">
          <div className="flex gap-3">
            <div className="h-10 w-10 rounded-full bg-error-container flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-error" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-on-surface">Launch failed</p>
              <p className="text-sm text-on-surface-variant" role="status" aria-live="polite">
                {toast.message}
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-gray-100 bg-white">
          <StepIndicator currentStep={currentStep} steps={STEPS} />
        </div>

        <div className="flex-1 p-6 sm:p-10 bg-slate-50">
          <form className="h-full">
            {currentStep === 0 && <PropertyProfileStep />}
            {currentStep === 1 && <PhysicalLayoutStep />}
            {currentStep === 2 && <UtilitiesFinancialsStep />}
            {currentStep === 3 && (
              <ReviewLaunchStep
                formData={formValues}
                onLaunch={handleLaunch}
                isSubmitting={isSubmitting}
                launched={launchComplete}
              />
            )}
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-6 py-2.5 rounded-lg font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 transition-colors"
          >
            Back
          </button>

          {currentStep < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Next Step
            </button>
          ) : null}
        </div>
      </div>
    </FormProvider>
  );
}
