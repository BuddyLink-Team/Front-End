import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getCustomAnswerSchema } from '../validation/aiAssistantValidation';
import { buildCustomAnswer, customFormDefaults } from '../utils/aiAssistantUtils';

/**
 * "Other answer" form of a choice card: values, the step's schema and the answer sent
 * @param {Object} card
 * @param {(custom: Object, label: string) => void} onSubmit
 */
export const useChoiceCustomForm = (card, onSubmit) => {
  const schema = useMemo(() => getCustomAnswerSchema(card), [card]);
  const {
    register,
    control,
    handleSubmit,
    setValue,
    trigger,
    clearErrors,
    watch,
    formState: { errors, isSubmitted },
  } = useForm({ resolver: zodResolver(schema), defaultValues: customFormDefaults(card) });

  // Time step, live check before any submit: the booking window needs both the date and the time, so changing one
  // re-checks the two fields; an error shows as soon as it exists and goes away once fixed
  const [date, time] = watch(['date', 'time']);
  // Runs on a date / time change only, never because the form was just submitted
  const isSubmittedRef = useRef(isSubmitted);
  isSubmittedRef.current = isSubmitted;
  useEffect(() => {
    if (date === undefined && time === undefined) return; // not the time step
    if (date && time) trigger(['date', 'time']);
    else if (!isSubmittedRef.current) clearErrors(['date', 'time']);
    else trigger(['date', 'time']);
  }, [date, time, trigger, clearErrors]);

  const submit = useMemo(
    () =>
      handleSubmit((values) => {
        const answer = buildCustomAnswer(card, values);
        if (answer) onSubmit(answer.custom, answer.label);
      }),
    [handleSubmit, card, onSubmit],
  );

  // The place step sends the place picked in the search modal right away
  const submitPlace = useCallback(
    ({ id, name, address, placeId, coordinates }) => {
      setValue('name', name || '');
      setValue('address', address || '');
      setValue('id', id || undefined);
      setValue('placeId', placeId || undefined);
      setValue('coordinates', coordinates);
      submit();
    },
    [setValue, submit],
  );

  const errorOf = useCallback((name) => errors[name]?.message, [errors]);

  return { register, control, submit, submitPlace, errorOf };
};

export default useChoiceCustomForm;
