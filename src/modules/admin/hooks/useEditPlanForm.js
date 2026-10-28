import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { fetchAdminPlanDetail } from '../redux/adminSlice';
import { getPlanFormSchema } from '../validation/planValidation';
import { ADMIN_ERROR_MESSAGES, PLAN_FEATURE_FIELDS, UNLIMITED_LIMIT } from '../constants/admin.constants';

const toFormValues = (plan) => ({
  name: plan.name,
  price: plan.price,
  isActive: plan.isActive,
  features: Object.fromEntries(
    PLAN_FEATURE_FIELDS.map(({ key, fallback }) => [key, plan.features?.[key] ?? fallback])
  ),
});

/**
 * Edit form of one plan. Each time the modal opens, the plan is fetched again and the form starts
 * from it (nothing typed before a cancel is kept). A new Premium price is confirmed before saving.
 * @param {Object} plan - Plan of the list (shown until the fresh one arrives)
 * @param {boolean} isOpen
 * @param {(id: string, payload: Object) => Promise<boolean>} onSave - true when saved
 * @param {Function} onClose
 */
export const useEditPlanForm = (plan, isOpen, onSave, onClose) => {
  const dispatch = useDispatch();
  const [freshPlan, setFreshPlan] = useState(plan);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  // Payload waiting for the price change confirmation
  const [pendingPayload, setPendingPayload] = useState(null);

  const schema = useMemo(() => getPlanFormSchema(plan.isFree), [plan.isFree]);
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm({ resolver: zodResolver(schema), defaultValues: toFormValues(plan) });

  useEffect(() => {
    if (!isOpen) return undefined;
    let isCurrent = true;
    reset(toFormValues(plan));
    setPendingPayload(null);
    setLoadError(null);
    setIsLoading(true);
    dispatch(fetchAdminPlanDetail(plan.id))
      .unwrap()
      .then((data) => {
        if (!isCurrent) return;
        setFreshPlan(data.plan);
        reset(toFormValues(data.plan));
      })
      .catch((err) => {
        if (isCurrent) setLoadError(getApiErrorMsg(ADMIN_ERROR_MESSAGES, err, 'Không tải được thông tin gói.'));
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });
    return () => {
      isCurrent = false;
    };
    // Reload only when the modal opens (the list may hand a new object for the same plan meanwhile)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, plan.id]);

  const save = useCallback(
    async (payload) => {
      setPendingPayload(null);
      if (await onSave(plan.id, payload)) onClose();
    },
    [onSave, onClose, plan.id]
  );

  const submit = useMemo(
    () =>
      handleSubmit((values) => {
        if (!plan.isFree && values.price !== freshPlan.price) {
          setPendingPayload(values);
          return;
        }
        save(values);
      }),
    [handleSubmit, plan.isFree, freshPlan.price, save]
  );

  const features = watch('features');
  const isUnlimited = (key) => features?.[key] === UNLIMITED_LIMIT;
  // "Vô cực" off gives back the default limit of the field, which the admin can then change
  const toggleUnlimited = (key, fallback) =>
    setValue(`features.${key}`, isUnlimited(key) ? fallback : UNLIMITED_LIMIT, {
      shouldDirty: true,
      shouldValidate: true,
    });

  return {
    plan: freshPlan,
    isLoading,
    loadError,
    register,
    control,
    submit,
    isDirty,
    isActive: watch('isActive'),
    errorOf: (name) => name.split('.').reduce((node, part) => node?.[part], errors)?.message,
    isUnlimited,
    toggleUnlimited,
    pendingPayload,
    confirmPriceChange: () => save(pendingPayload),
    cancelPriceChange: () => setPendingPayload(null),
  };
};

export default useEditPlanForm;
