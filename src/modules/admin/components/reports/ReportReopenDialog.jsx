import React from 'react';
import { Modal } from '../../../../components/feedback/Modal';
import { Button } from '../../../../components/ui/Button';
import { Textarea } from '../../../../components/ui/Textarea';
import { useReportReopenForm } from '../../hooks/useReportInvestigation';

const FORM_ID = 'report-reopen-form';

/**
 * Sends a closed report back to reviewing. The sanctions already applied stay in effect.
 */
export const ReportReopenDialog = ({ report, isOpen, onClose, onReopen, isActionLoading }) => {
  const { form, submit } = useReportReopenForm(report, isOpen, onReopen, onClose);
  const { register, formState: { errors } } = form;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mở lại hồ sơ điều tra"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" form={FORM_ID} variant="primary" disabled={isActionLoading}>
            Xác nhận mở lại
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={submit} className="space-y-4">
        <p className="text-label-md text-text-muted">
          Báo cáo sẽ chuyển lại về trạng thái <strong>Đang xem xét</strong>. Các chế tài đã thi hành không bị hủy tự động.
        </p>
        <Textarea
          label="Lý do mở lại"
          required
          rows={3}
          placeholder="Nhập lý do hoặc tình tiết mới dẫn tới việc mở lại..."
          error={errors.note?.message}
          {...register('note')}
        />
      </form>
    </Modal>
  );
};

export default ReportReopenDialog;
