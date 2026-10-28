import { useCallback, useMemo } from 'react';
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
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: customFormDefaults(card) });

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
    ({ name, address, placeId, coordinates }) => {
      setValue('name', name || '');
      setValue('address', address || '');
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
