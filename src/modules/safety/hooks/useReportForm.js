import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '../../../hooks/useToast';
import { useSafetyActions } from './useSafetyActions';
import { reportSchema } from '../validation/safetyValidation';
import {
  REPORT_CATEGORY_OPTIONS,
  REPORT_FORM_DEFAULTS,
  REPORT_FORM_MESSAGES,
  REPORT_LIMITS,
  REPORT_TARGET_TYPES,
} from '../constants/safetyConstants';

/**
 * Report form of the ReportModal: category, description, evidence images and the report sent.
 * @param {Object} params
 * @param {Object|null} params.target - { reportedUserId, targetType, targetMessageId, targetPlaydateId }
 * @param {boolean} params.isOpen - The form is reset each time the modal opens
 * @param {Function} params.onSubmitted - Called after the report was sent
 */
export const useReportForm = ({ target, isOpen, onSubmitted }) => {
  const toast = useToast();
  const { reportUser, uploadEvidence, isReportSubmitting } = useSafetyActions();
  const [isUploading, setIsUploading] = useState(false);

  const { handleSubmit, watch, setValue, reset } = useForm({
    resolver: zodResolver(reportSchema),
    defaultValues: REPORT_FORM_DEFAULTS,
  });

  useEffect(() => {
    if (isOpen) reset(REPORT_FORM_DEFAULTS);
  }, [isOpen, reset]);

  const category = watch('category');
  const description = watch('description');
  const evidenceUrls = watch('evidenceUrls');
  const selectedOption = useMemo(() => REPORT_CATEGORY_OPTIONS.find((c) => c.value === category) || null, [category]);

  const selectCategory = useCallback((value) => setValue('category', value || ''), [setValue]);
  const changeDescription = useCallback((value) => setValue('description', value), [setValue]);

  // Checks and upload live in useSafetyActions; the form keeps the uploaded URLs
  const addEvidence = useCallback(
    async (files) => {
      if (!files.length) return;
      if (evidenceUrls.length + files.length > REPORT_LIMITS.MAX_EVIDENCE_URLS) {
        toast.error(REPORT_FORM_MESSAGES.EVIDENCE_LIMIT);
        return;
      }
      setIsUploading(true);
      try {
        const urls = await uploadEvidence(files);
        setValue('evidenceUrls', [...evidenceUrls, ...urls].slice(0, REPORT_LIMITS.MAX_EVIDENCE_URLS));
      } finally {
        setIsUploading(false);
      }
    },
    [evidenceUrls, uploadEvidence, setValue, toast],
  );

  const removeEvidence = useCallback(
    (indexToRemove) => setValue('evidenceUrls', evidenceUrls.filter((_, idx) => idx !== indexToRemove)),
    [evidenceUrls, setValue],
  );

  const submit = useMemo(
    () =>
      handleSubmit(
        async (values) => {
          const targetType = target?.targetType || REPORT_TARGET_TYPES.USER;
          const result = await reportUser({
            reportedUserId: target?.reportedUserId,
            targetType,
            targetMessageId: targetType === REPORT_TARGET_TYPES.MESSAGE ? target?.targetMessageId || null : null,
            targetPlaydateId: targetType === REPORT_TARGET_TYPES.PLAYDATE ? target?.targetPlaydateId || null : null,
            category: values.category,
            reason: REPORT_CATEGORY_OPTIONS.find((c) => c.value === values.category)?.label || values.category,
            description: values.description,
            evidenceUrls: values.evidenceUrls,
          });
          if (result.success) onSubmitted?.();
        },
        // Show the first invalid field (the submit button already needs a category)
        (errors) => {
          const firstError = Object.values(errors)[0];
          if (firstError?.message) toast.error(firstError.message);
        },
      ),
    [handleSubmit, target, reportUser, onSubmitted, toast],
  );

  return {
    category,
    selectedOption,
    description,
    evidenceUrls,
    isUploading,
    isSubmitting: isReportSubmitting,
    isBusy: isReportSubmitting || isUploading,
    canAddEvidence: evidenceUrls.length < REPORT_LIMITS.MAX_EVIDENCE_URLS,
    selectCategory,
    changeDescription,
    addEvidence,
    removeEvidence,
    submit,
  };
};

export default useReportForm;
