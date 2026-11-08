import React from 'react';
import PropTypes from 'prop-types';
import { Plus, Trash2, BarChart3, CalendarCheck } from 'lucide-react';
import { Modal } from '../../../components/feedback/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useCreatePollForm } from '../hooks/useCreatePollForm.js';
import { POLL_LIMITS } from '../constants/chat.constants.js';

/**
 * "Tạo khảo sát giờ hẹn": the families of a playdate group chat vote for 2-5 time options,
 * typed or filled from the playdate's time suggestions (BUD-49 D5).
 */
export const CreatePollModal = ({ isOpen, onClose, conversationId, playdate, onPollCreated }) => {
  const form = useCreatePollForm({ conversationId, playdate, onCreated: onPollCreated });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (await form.submit()) onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary-dark">
            <BarChart3 className="w-4 h-4" />
          </div>
          <span className="font-semibold text-on-surface">Tạo khảo sát giờ hẹn</span>
        </div>
      }
      maxWidth="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button type="button" variant="ghost" onClick={onClose} disabled={form.isSubmitting}>
            Hủy
          </Button>
          <Button type="submit" form="create-poll-form" disabled={form.isSubmitting} isLoading={form.isSubmitting}>
            Tạo khảo sát
          </Button>
        </div>
      }
    >
      <form id="create-poll-form" onSubmit={handleSubmit} className="space-y-4 py-2">
        <Input
          label="Câu hỏi / Tiêu đề khảo sát"
          value={form.question}
          onChange={(event) => form.setQuestion(event.target.value)}
          placeholder="Ví dụ: Bình chọn thời gian hẹn chơi phù hợp"
          required
          maxLength={POLL_LIMITS.QUESTION_MAX_LENGTH}
        />

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-on-surface">
              Các khung giờ đề xuất (tối thiểu {POLL_LIMITS.MIN_OPTIONS})
            </span>
            <div className="flex items-center gap-1">
              {form.canSuggestSlots && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={form.fillSuggestedSlots}
                  isLoading={form.isLoadingSlots}
                  disabled={form.isLoadingSlots}
                  leftIcon={<CalendarCheck className="w-3.5 h-3.5" />}
                >
                  Gợi ý khung giờ
                </Button>
              )}
              {form.canAddOption && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={form.addOption}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Thêm lựa chọn
                </Button>
              )}
            </div>
          </div>

          {form.options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={option.label}
                onChange={(event) => form.changeOption(index, event.target.value)}
                placeholder={`Phương án ${index + 1} (VD: T7 15/11 · 09:00 - 11:00)`}
                aria-label={`Phương án ${index + 1}`}
                required
                maxLength={POLL_LIMITS.OPTION_MAX_LENGTH}
                className="flex-1"
              />
              {form.canRemoveOption && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => form.removeOption(index)}
                  aria-label={`Xóa phương án ${index + 1}`}
                  className="shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <p className="text-label-xs text-on-surface-variant">
          Khảo sát tự kết thúc sau {POLL_LIMITS.DEADLINE_HOURS} giờ hoặc khi tất cả phụ huynh trong nhóm đã bình chọn.
        </p>
      </form>
    </Modal>
  );
};

CreatePollModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  conversationId: PropTypes.string.isRequired,
  playdate: PropTypes.object,
  onPollCreated: PropTypes.func,
};

export default CreatePollModal;
