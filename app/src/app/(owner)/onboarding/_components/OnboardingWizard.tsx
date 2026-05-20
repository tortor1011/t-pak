"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import StepIndicator from "./StepIndicator";
import PropertyProfileStep from "./steps/PropertyProfileStep";
import PhysicalLayoutStep from "./steps/PhysicalLayoutStep";
import UtilitiesFinancialsStep from "./steps/UtilitiesFinancialsStep";
import ReviewLaunchStep from "./steps/ReviewLaunchStep";

// Zod Schemas
export const roomTypeSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Room type name is required"),
  baseRent: z.number().min(0, "Base rent must be positive"),
  securityDeposit: z.number().min(0, "Security deposit must be positive"),
});

export const onboardingSchema = z.object({
  // Step 1
  propertyName: z.string().min(2, "Property Name is required"),
  address: z.string().min(5, "Address is required"),
  phone: z.string().min(9, "Valid phone number is required"),

  // Step 2
  roomTypes: z.array(roomTypeSchema).min(1, "At least one room type is required"),
  floors: z.number().min(1, "Must have at least 1 floor").max(50, "Max 50 floors"),
  roomsPerFloor: z.number().min(1, "Must have at least 1 room per floor").max(100, "Max 100 rooms"),
  roomTypeAssignment: z.enum(["ALL_SAME", "PER_FLOOR"]),
  // Map of floor number to room type id
  floorAssignments: z.record(z.string().nullable()).optional(),

  // Step 3
  electricityRate: z.number().min(0).optional(),
  waterRate: z.number().min(0).optional(),
  waterRateType: z.enum(["PER_UNIT", "PER_PERSON", "FIXED"]),
  bankAccount: z.string().optional(),
  promptPay: z.string().optional(),
  bankName: z.string().optional(),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

const STEPS = ["Property Profile", "Physical Layout", "Utilities", "Review & Launch"];

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);

  const methods = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      propertyName: "",
      address: "",
      phone: "",
      roomTypes: [{ id: "1", name: "Standard", baseRent: 3500, securityDeposit: 7000 }],
      floors: 1,
      roomsPerFloor: 10,
      roomTypeAssignment: "ALL_SAME",
      floorAssignments: {},
      waterRateType: "PER_UNIT",
    },
    mode: "onTouched",
  });

  const nextStep = async () => {
    // Basic validation based on step
    let fieldsToValidate: any[] = [];
    if (currentStep === 0) fieldsToValidate = ["propertyName", "address", "phone"];
    if (currentStep === 1) fieldsToValidate = ["roomTypes", "floors", "roomsPerFloor", "roomTypeAssignment", "floorAssignments"];
    
    if (fieldsToValidate.length > 0) {
      const isStepValid = await methods.trigger(fieldsToValidate as any);
      if (!isStepValid) return;
    }
    
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-gray-100 bg-white">
          <StepIndicator currentStep={currentStep} steps={STEPS} />
        </div>

        <div className="flex-1 p-6 sm:p-10 bg-slate-50">
          <form className="h-full">
            {currentStep === 0 && <PropertyProfileStep />}
            {currentStep === 1 && <PhysicalLayoutStep />}
            {currentStep === 2 && <UtilitiesFinancialsStep />}
            {currentStep === 3 && <ReviewLaunchStep formData={methods.getValues()} />}
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
