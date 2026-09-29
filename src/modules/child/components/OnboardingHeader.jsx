import React from 'react';
import { Sparkles } from 'lucide-react';

export const OnboardingHeader = ({ currentStep, totalSteps, stepInfo }) => {
  return (
    <div className="mb-8">
      {/* Top Header Badge */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3.5 py-1.5 rounded-full border border-primary/20 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Thiết lập hồ sơ bé & Tiêu chí bạn chơi</span>
        </div>

        <span className="text-xs font-semibold text-text-muted">
          Bước {currentStep} / {totalSteps}
        </span>
      </div>

      {/* Stepper Progress Bar */}
      <div className="w-full bg-surface-container-low h-2 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500 rounded-full"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>

      {/* Header Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight font-display mb-1.5">
          {stepInfo.title}
        </h1>
        <p className="text-sm text-text-muted">
          {stepInfo.desc}
        </p>
      </div>
    </div>
  );
};

export default OnboardingHeader;
