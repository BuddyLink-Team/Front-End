import React, { useState } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { Plus, Trash2, BarChart3, Sparkles } from 'lucide-react';
import { Modal } from '../../../components/feedback/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useToast } from '../../../hooks/useToast';
import { usePoll } from '../hooks/usePoll.js';
import playdateApi from '../../playdate/api/playdateApi.js';

export const CreatePollModal = ({ isOpen, onClose, conversationId, playdate, onPollCreated }) => {
  const toast = useToast();
  const [question, setQuestion] = useState('Bình chọn thời gian hẹn chơi phù hợp');
  const [options, setOptions] = useState([
    'Thứ Bảy, 09:00 - 11:00',
    'Chủ Nhật, 15:00 - 17:00',
  ]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const { createPoll, isSubmitting } = usePoll();

  const handleSuggestSlots = async () => {
    const childId = playdate?.hostChild?.id || playdate?.hostChildId;
    if (!childId) {
      toast.info('Không có thông tin bé để gợi ý khung giờ.');
      return;
    }
    try {
      setIsLoadingSlots(true);
      const participantChildIds = (playdate.participants || [])
        .map((p) => p.childId || p.child?.id)
        .filter(Boolean)
        .join(',');
      const res = await playdateApi.getTimeSlotSuggestions({
        childId: typeof childId === 'object' ? childId._id || childId.id : String(childId),
        participantChildIds: participantChildIds || undefined,
        durationMinutes: playdate.durationMinutes || 60,
      });
      const slots = res.data?.data?.slots || res.data?.slots || [];
      if (slots.length > 0) {
        const formattedSlots = slots.slice(0, 4).map((slot) => {
          const d = dayjs(slot.date);
          const end = dayjs(`${slot.date}T${slot.time}`).add(slot.durationMinutes || 60, 'minute');
          const dayName = d.day() === 0 ? 'Chủ Nhật' : `Thứ ${d.day() + 1}`;
          return `${dayName} (${d.format('DD/MM')}), ${slot.time} - ${end.format('HH:mm')}`;
        });
        setOptions(formattedSlots);
        toast.success(`Đã tự động điền ${formattedSlots.length} khung giờ phù hợp nhất.`);
      } else {
        toast.info('Chưa tìm thấy khung giờ gợi ý phù hợp.');
      }
    } catch (_err) {
      toast.error('Không thể lấy gợi ý khung giờ.');
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleOptionChange = (index, value) => {
    setOptions((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleAddOption = () => {
    if (options.length >= 5) return;
    setOptions((prev) => [...prev, '']);
  };

  const handleRemoveOption = (index) => {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanQuestion = question.trim();
    if (!cleanQuestion) {
      toast.error('Vui lòng nhập câu hỏi bình chọn.');
      return;
    }

    const cleanOptions = options.map((opt) => opt.trim()).filter(Boolean);
    if (cleanOptions.length < 2) {
      toast.error('Cần ít nhất 2 phương án bình chọn.');
      return;
    }

    const payload = {
      question: cleanQuestion,
      options: cleanOptions.map((label, idx) => ({
        id: `opt_${idx + 1}`,
        label,
      })),
      deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    };

    const resData = await createPoll(conversationId, payload);
    if (resData) {
      if (onPollCreated) {
        onPollCreated(resData);
      }
      onClose();
    }
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
          <span className="font-bold text-on-surface">Tạo khảo sát giờ hẹn</span>
        </div>
      }
      maxWidth="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="submit" form="create-poll-form" disabled={isSubmitting} isLoading={isSubmitting}>
            Tạo khảo sát
          </Button>
        </div>
      }
    >
      <form id="create-poll-form" onSubmit={handleSubmit} className="space-y-4 py-2">
        <div>
          <label className="block text-xs font-semibold text-on-surface mb-1.5">
            Câu hỏi / Tiêu đề khảo sát
          </label>
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ví dụ: Bình chọn thời gian hẹn chơi phù hợp"
            required
            maxLength={150}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-on-surface">
              Các khung giờ đề xuất (tối thiểu 2)
            </label>
            <div className="flex items-center gap-2.5">
              {playdate && (
                <button
                  type="button"
                  onClick={handleSuggestSlots}
                  disabled={isLoadingSlots}
                  className="text-xs font-semibold text-secondary hover:text-secondary-dark flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isLoadingSlots ? 'Đang gợi ý...' : 'Gợi ý từ AI'}
                </button>
              )}
              {options.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-xs font-semibold text-primary hover:text-primary-dark flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm lựa chọn
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {options.map((opt, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={opt}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Phương án ${index + 1} (VD: Thứ Bảy, 09:00 - 11:00)`}
                  required
                  maxLength={100}
                  className="flex-1"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    className="p-2 text-outline hover:text-error rounded-lg hover:bg-surface-container transition-colors shrink-0"
                    title="Xóa lựa chọn"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <p className="text-label-xs text-on-surface-variant">
          Khảo sát sẽ tự động kết thúc sau 48 giờ hoặc khi tất cả phụ huynh trong nhóm đã hoàn tất bình chọn.
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

