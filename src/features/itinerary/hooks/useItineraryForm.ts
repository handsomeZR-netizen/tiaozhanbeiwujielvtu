import { useState } from 'react';
import { ItineraryForm } from '../itinerary.types';

const INITIAL_FORM: ItineraryForm = {
  city: '',
  startDate: '',
  endDate: '',
  days: 3,
  travelers: { count: 1, type: 'solo' },
  interests: [],
  intensity: 'moderate',
  budget: 'comfortable',
  transport: 'public',
  requirements: [],
  mustVisit: []
};

export interface FormErrors {
  city?: string;
  startDate?: string;
  days?: string;
  interests?: string;
  budget?: string;
  transport?: string;
}

export function useItineraryForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ItineraryForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const updateField = <K extends keyof ItineraryForm>(field: K, value: ItineraryForm[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user updates it
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof FormErrors];
        return newErrors;
      });
    }
  };

  const validateStep = (): boolean => {
    const newErrors: FormErrors = {};

    if (step === 1) {
      if (!formData.city || formData.city.trim() === '') {
        newErrors.city = '请选择目的地';
      }
      if (!formData.startDate) {
        newErrors.startDate = '请选择出发日期';
      } else {
        // Check if date is valid
        const date = new Date(formData.startDate);
        if (isNaN(date.getTime())) {
          newErrors.startDate = '请输入有效的日期';
        }
      }
      if (formData.days < 1 || formData.days > 30) {
        newErrors.days = '旅行天数必须在 1-30 之间';
      }
    }

    if (step === 2) {
      if (formData.interests.length < 3) {
        newErrors.interests = '请至少选择 3 个兴趣标签';
      }
    }

    if (step === 3) {
      if (!formData.budget) {
        newErrors.budget = '请选择预算范围';
      }
      if (!formData.transport) {
        newErrors.transport = '请选择交通方式';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isStepValid = () => {
    if (step === 1) {
      return !!formData.city && 
             !!formData.startDate && 
             formData.days >= 1 && 
             formData.days <= 30;
    }
    if (step === 2) {
      return formData.interests.length >= 3;
    }
    if (step === 3) {
      return !!formData.budget && !!formData.transport;
    }
    return true;
  };

  const clearErrors = () => {
    setErrors({});
  };

  return { 
    step, 
    formData, 
    errors,
    nextStep, 
    prevStep, 
    updateField, 
    validateStep,
    isStepValid,
    clearErrors
  };
}
