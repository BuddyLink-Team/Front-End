import React from 'react';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../../../components';

export const OnboardingFooter = ({
  currentStep,
  totalSteps,
  isLoading,
  onPrev,
  onNext,
  onSubmit,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 mt-10 pt-6 border-t border-hairline">
      {currentStep > 1 ? (
        <Button
          type="button"
          variant="outline"
          onClick={onPrev}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Quay lại
        </Button>
      ) : (
        <div />
      )}

      {currentStep < totalSteps ? (
        <Button
          type="button"
          onClick={onNext}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Tiếp tục
        </Button>
      ) : (
        <Button
          type="button"
          onClick={onSubmit}
          isLoading={isLoading}
          rightIcon={<Sparkles className="w-4 h-4" />}
        >
          Hoàn tất &amp; Khám phá bạn chơi
        </Button>
      )}
    </div>
  );
};

export default OnboardingFooter;
