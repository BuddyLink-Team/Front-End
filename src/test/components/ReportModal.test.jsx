import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ReportModal } from '../../modules/safety/components/ReportModal';
import safetyReducer from '../../modules/safety/redux/safetySlice';
import { REPORT_CATEGORIES } from '../../modules/safety/constants/safetyConstants';
import { safetyApi } from '../../modules/safety/api/safetyApi';

const mockReportUser = vi.fn();

vi.mock('../../modules/safety/hooks/useSafetyActions', () => ({
  useSafetyActions: () => ({
    reportUser: mockReportUser,
    isSubmitting: false,
  }),
}));

vi.mock('../../hooks/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

describe('ReportModal Component', () => {
  let store;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReportUser.mockResolvedValue({ success: true });
    store = configureStore({
      reducer: {
        safety: safetyReducer,
      },
    });
  });

  const renderModal = (props = {}) => {
    return render(
      <Provider store={store}>
        <ReportModal
          isOpen={true}
          onClose={vi.fn()}
          reportedUserId="target-user-123"
          targetName="Phụ huynh Thảo"
          {...props}
        />
      </Provider>,
    );
  };

  it('renders title, target name, category chips and description field', () => {
    renderModal();

    expect(screen.getByText('Báo cáo vi phạm')).toBeInTheDocument();
    expect(screen.getByText('Phụ huynh Thảo')).toBeInTheDocument();
    expect(screen.getByText('Quấy rối / Làm phiền')).toBeInTheDocument();
    expect(screen.getByText('Nội dung không phù hợp')).toBeInTheDocument();
    expect(screen.getByText('Spam / Tin rác')).toBeInTheDocument();
    expect(screen.getByText('An toàn cho trẻ em')).toBeInTheDocument();
    expect(screen.getByLabelText(/Mô tả chi tiết/i)).toBeInTheDocument();
  });

  it('disables submit button when no category is selected', () => {
    renderModal();

    const submitBtn = screen.getByRole('button', { name: /Gửi báo cáo/i });
    expect(submitBtn).toBeDisabled();
  });

  it('enables submit button when a category chip is selected and submits payload', async () => {
    const handleSuccess = vi.fn();
    const handleClose = vi.fn();

    renderModal({ onSubmitSuccess: handleSuccess, onClose: handleClose });

    const harassmentChip = screen.getByText('Quấy rối / Làm phiền');
    fireEvent.click(harassmentChip);

    const submitBtn = screen.getByRole('button', { name: /Gửi báo cáo/i });
    expect(submitBtn).not.toBeDisabled();

    // Fill in optional description
    const descInput = screen.getByPlaceholderText(/Cung cấp thêm chi tiết/i);
    fireEvent.change(descInput, { target: { value: 'Gửi nhiều tin nhắn quấy rối làm phiền.' } });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockReportUser).toHaveBeenCalledWith({
        reportedUserId: 'target-user-123',
        targetType: 'user',
        targetMessageId: null,
        targetPlaydateId: null,
        category: REPORT_CATEGORIES.HARASSMENT,
        reason: 'Quấy rối / Làm phiền',
        description: 'Gửi nhiều tin nhắn quấy rối làm phiền.',
        evidenceUrls: [],
      });
      expect(handleClose).toHaveBeenCalled();
      expect(handleSuccess).toHaveBeenCalled();
    });
  });

  it('uploads evidence image, updates counter to 1/5, and shows thumbnail', async () => {
    const uploadSpy = vi.spyOn(safetyApi, 'uploadEvidence').mockResolvedValue({
      status: 'success',
      data: {
        mediaUrl: 'https://res.cloudinary.com/test-cloud/image/upload/v1/evidence1.png',
        publicId: 'test-evidence-1',
      },
    });

    renderModal();

    expect(screen.getByText('0/5')).toBeInTheDocument();

    const file = new File(['fake-image-bytes'], 'screenshot.png', { type: 'image/png' });
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(uploadSpy).toHaveBeenCalledWith(file);
      expect(screen.getByText('1/5')).toBeInTheDocument();
      expect(screen.getByAltText('Bằng chứng 1')).toBeInTheDocument();
      expect(screen.getByAltText('Bằng chứng 1')).toHaveAttribute(
        'src',
        'https://res.cloudinary.com/test-cloud/image/upload/v1/evidence1.png'
      );
    });

    // Remove the uploaded image
    const removeBtn = screen.getByRole('button', { name: /Xóa ảnh 1/i });
    fireEvent.click(removeBtn);

    expect(screen.getByText('0/5')).toBeInTheDocument();
    expect(screen.queryByAltText('Bằng chứng 1')).not.toBeInTheDocument();

    uploadSpy.mockRestore();
  });

  it('calls onClose when Cancel button is clicked', () => {
    const handleClose = vi.fn();
    renderModal({ onClose: handleClose });

    const cancelBtn = screen.getByRole('button', { name: /Hủy/i });
    fireEvent.click(cancelBtn);

    expect(handleClose).toHaveBeenCalled();
  });
});
