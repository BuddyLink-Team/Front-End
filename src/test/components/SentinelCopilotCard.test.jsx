import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen, fireEvent } from '../utils/testUtils';
import { SentinelCopilotCard } from '../../modules/admin/components/reports/SentinelCopilotCard';

const assessment = {
  assessedAt: '2026-11-01T07:30:00.000Z',
  confidenceScore: 90,
  verdict: 'violation',
  summary: 'Tóm tắt của AI',
  strikeCount: 2,
  policyClause: 'Điều 5.1',
  evidenceAnalysis: { isValid: true, notes: 'Ảnh chụp khớp với tin nhắn' },
  recommendedSanctions: [{ type: 'warn' }, { type: 'delete_message' }],
  corroboration: { isCorroborated: true, reporterCount: 3, requiredReporters: 3, windowDays: 7 },
  monitoring: { reportsReceived: 1, timeWindow: '30 phút', riskLevel: 'low', investigationSteps: ['Bước kiểm tra của AI'] },
  draftNotes: { adminNote: 'Ghi chú nháp của AI' },
};
// The policy matrix never drives the AI recommendation
const policyGuidance = { standardActions: [{ type: 'suspend', durationDays: 3 }] };

const renderCard = (report, onAssessSentinel = vi.fn()) => {
  renderWithProviders(
    <SentinelCopilotCard
      report={{ id: 'r1', status: 'pending', category: 'spam', policyGuidance, ...report }}
      isActionLoading={false}
      onAssessSentinel={onAssessSentinel}
    />,
  );
  return onAssessSentinel;
};

describe('SentinelCopilotCard', () => {
  describe('AI verdict', () => {
    it('recommends the AI sanctions when it found a violation', () => {
      renderCard({ sentinelAssessment: assessment });

      expect(screen.getByText('AI kết luận: Có vi phạm')).toBeInTheDocument();
      expect(screen.getByText('Tóm tắt của AI')).toBeInTheDocument();
      expect(screen.getByText('Gửi cảnh cáo')).toBeInTheDocument();
      expect(screen.queryByText(/Tạm đình chỉ tài khoản/)).not.toBeInTheDocument();
    });

    it('recommends nothing and points to a dismissal when it found no violation', () => {
      renderCard({ sentinelAssessment: { ...assessment, verdict: 'no_violation', recommendedSanctions: [] } });

      expect(screen.getByText('AI kết luận: Không vi phạm')).toBeInTheDocument();
      expect(screen.getByText(/không đề xuất chế tài/)).toBeInTheDocument();
      expect(screen.getByText(/bấm Không vi phạm — bác bỏ/)).toBeInTheDocument();
      expect(screen.queryByText('Gửi cảnh cáo')).not.toBeInTheDocument();
    });

    it('never shows sanctions for an unclear verdict, even stored ones', () => {
      renderCard({ sentinelAssessment: { ...assessment, verdict: 'unclear' } });

      expect(screen.getByText('AI kết luận: Chưa rõ')).toBeInTheDocument();
      expect(screen.getByText(/chưa đủ căn cứ/)).toBeInTheDocument();
      expect(screen.queryByText('Gửi cảnh cáo')).not.toBeInTheDocument();
    });

    it('asks for a new analysis on an assessment made before verdicts', () => {
      const { verdict: _verdict, ...withoutVerdict } = assessment;
      renderCard({ sentinelAssessment: withoutVerdict });

      expect(screen.getByText('AI kết luận: Chưa rõ')).toBeInTheDocument();
      expect(screen.getByText(/chưa có kết luận của AI/)).toBeInTheDocument();
    });
  });

  it('has no button applying sanctions: the decision is taken from the drawer footer', () => {
    renderCard({ sentinelAssessment: assessment });

    expect(screen.queryByRole('button', { name: /Áp dụng/ })).not.toBeInTheDocument();
  });

  it('keeps the figures behind the suggestion folded until asked for', () => {
    renderCard({ sentinelAssessment: assessment });

    expect(screen.queryByText('Mật độ báo cáo')).not.toBeInTheDocument();
    expect(screen.queryByText('Bước kiểm tra của AI')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Xem chi tiết phân tích' }));

    expect(screen.getByText('Mật độ báo cáo')).toBeInTheDocument();
    expect(screen.getByText('Xác thực chéo')).toBeInTheDocument();
    expect(screen.getByText('Bước kiểm tra của AI')).toBeInTheDocument();
    expect(screen.getByText('Bằng chứng tin nhắn / hình ảnh khớp với nội dung tố cáo')).toBeInTheDocument();
    expect(screen.getByText(/Điều 5.1/)).toBeInTheDocument();
    expect(screen.getByText(/lần vi phạm thứ 2/)).toBeInTheDocument();
    expect(screen.getByText('Ảnh chụp khớp với tin nhắn')).toBeInTheDocument();
    expect(screen.getByText('Ghi chú nháp của AI')).toBeInTheDocument();
  });

  it('says how many reports arrived since the AI assessment', () => {
    renderCard({ sentinelAssessment: { ...assessment, newReportsSinceAssessment: 2 } });

    expect(screen.getByText('2 báo cáo mới')).toBeInTheDocument();
  });

  it('shows no notice when nothing arrived since the assessment', () => {
    renderCard({ sentinelAssessment: assessment });

    expect(screen.queryByText(/báo cáo mới/)).not.toBeInTheDocument();
  });

  describe('running the analysis', () => {
    it('offers a first analysis on a case without one', () => {
      const onAssess = renderCard({ sentinelAssessment: null });

      fireEvent.click(screen.getByRole('button', { name: 'Chạy AI phân tích' }));

      expect(onAssess).toHaveBeenCalledWith('r1', false);
    });

    it('offers a new analysis on an open case', () => {
      const onAssess = renderCard({ sentinelAssessment: assessment });

      fireEvent.click(screen.getByRole('button', { name: /Phân tích lại/ }));

      expect(onAssess).toHaveBeenCalledWith('r1', true);
    });

    it('offers none on a closed case', () => {
      renderCard({ status: 'resolved', sentinelAssessment: assessment });

      expect(screen.queryByRole('button', { name: /Phân tích lại/ })).not.toBeInTheDocument();
    });
  });
});
