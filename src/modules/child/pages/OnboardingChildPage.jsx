import React from 'react';
import { useOnboardingChild } from '../hooks/useOnboardingChild';
import { Card } from '../../../components';
import {
  OnboardingHeader,
  ChildBasicInfoStep,
  ChildInterestsStep,
  PlaydateCriteriaStep,
  OnboardingFooter,
  OnboardingSuccessStep,
} from '../components';

const STEP_INFOS = [
  {
    title: 'Tiêu chí tìm bạn chơi',
    desc: 'Thiết lập thời gian, địa điểm và bán kính tìm kiếm lý tưởng cho gia đình',
  },
  {
    title: 'Hồ sơ & Sở thích của bé',
    desc: 'Giới thiệu thông tin, sở thích và tính cách để BuddyLink tìm bạn phù hợp nhất',
  },
  {
    title: 'Sẵn sàng kết nối',
    desc: 'Hồ sơ và tiêu chí đã sẵn sàng để khám phá cộng đồng bạn nhỏ',
  },
];

export const OnboardingChildPage = () => {
  const {
    currentStep,
    totalSteps,
    isCompleted,
    formData,
    formErrors,
    isLoading,
    updateField,
    toggleArrayItem,
    nextStep,
    prevStep,
    submitOnboarding,
    completeAndExplore,
  } = useOnboardingChild();

  return (
    <div className="min-h-screen bg-canvas py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center relative overflow-hidden">
      {/* Background Soft Glow matching Stitch */}
      <div className="fixed inset-0 pointer-events-none -z-10 flex overflow-hidden opacity-30">
        <div className="w-1/2 h-full bg-gradient-to-br from-primary-fixed/20 via-surface-container-low to-surface" />
        <div className="w-1/2 h-full bg-gradient-to-bl from-secondary-fixed/20 via-surface-container-lowest to-surface" />
        <div className="absolute inset-0 backdrop-blur-3xl" />
      </div>

      {/* Main Single Centered Card with shared Card component */}
      <Card className="w-full max-w-3xl rounded-3xl shadow-xl shadow-surface-tint/5 border border-hairline p-6 sm:p-10 flex flex-col relative transition-all duration-300">
        {/* Step Indicator Header (Only shown during input steps) */}
        {!isCompleted && (
          <OnboardingHeader
            currentStep={currentStep}
            totalSteps={totalSteps}
            stepInfo={STEP_INFOS[currentStep - 1]}
          />
        )}

        {/* STEP 1: Parent Preference / Matching Criteria */}
        {currentStep === 1 && !isCompleted && (
          <PlaydateCriteriaStep
            formData={formData}
            formErrors={formErrors}
            updateField={updateField}
            toggleArrayItem={toggleArrayItem}
          />
        )}

        {/* STEP 2: Create Child Profile (Basic Info + Interests & Personality combined) */}
        {currentStep === 2 && !isCompleted && (
          <div className="space-y-8 animate-fadeIn">
            {/* Child basic info */}
            <ChildBasicInfoStep
              formData={formData}
              formErrors={formErrors}
              updateField={updateField}
            />

            <div className="border-t border-hairline pt-6">
              <h3 className="text-base font-bold text-on-surface mb-4">
                Sở thích & Tính cách của con
              </h3>
              <ChildInterestsStep
                formData={formData}
                formErrors={formErrors}
                toggleArrayItem={toggleArrayItem}
              />
            </div>
          </div>
        )}

        {/* STEP 3: Success Screen (Stitch Flow) */}
        {isCompleted && (
          <OnboardingSuccessStep
            formData={formData}
            onComplete={completeAndExplore}
          />
        )}

        {/* Navigation Action Buttons (Hidden on completion screen) */}
        {!isCompleted && (
          <OnboardingFooter
            currentStep={currentStep}
            totalSteps={totalSteps}
            isLoading={isLoading}
            onPrev={prevStep}
            onNext={nextStep}
            onSubmit={submitOnboarding}
          />
        )}
      </Card>
    </div>
  );
};

export default OnboardingChildPage;
