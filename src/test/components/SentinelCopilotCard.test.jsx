import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen } from '../utils/testUtils';
import { SentinelCopilotCard } from '../../modules/admin/components/reports/SentinelCopilotCard';

const assessment = {
  assessedAt: '2026-11-01T07:30:00.000Z',
  confidenceScore: 90,
  verdict: 'violation',
  summary: 'Tóm tắt của AI',
  recommendedSanctions: [{ type: 'warn' }, { type: 'delete_message' }],
  corroboration: { isCorroborated: true, reporterCount: 3, requiredReporters: 3, windowDays: 7 },
  monitoring: { reportsReceived: 1, timeWindow: '30 phút', riskLevel: 'low', investigationSteps: [] },
};
// The policy matrix (policy panel) never drives the AI recommendation
const policyGuidance = { standardActions: [{ type: 'suspend', durationDays: 3 }] };

const renderCard = (report) =>
  renderWithProviders(
    <SentinelCopilotCard
      report={{ id: 'r1', status: 'reviewing', category: 'spam', policyGuidance, ...report }}
      isActionLoading={false}
      onAssessSentinel={vi.fn()}
      onApplySentinel={vi.fn()}
    />,
  );

const applyButton = () => screen.queryByRole('button', { name: /Áp dụng chế tài AI đề xuất/ });

describe('SentinelCopilotCard', () => {
  describe('AI verdict', () => {
    it('recommends the AI sanctions when it found a violation', () => {
      renderCard({ sentinelAssessment: assessment });

      expect(screen.getByText('AI kết luận: Có vi phạm')).toBeInTheDocument();
      expect(screen.getByText('Gửi cảnh cáo')).toBeInTheDocument();
      expect(screen.queryByText('Tạm đình chỉ tài khoản')).not.toBeInTheDocument();
    });

    it('recommends nothing and points to a dismissal when it found no violation', () => {
      renderCard({ sentinelAssessment: { ...assessment, verdict: 'no_violation', recommendedSanctions: [] } });

      expect(screen.getByText('AI kết luận: Không vi phạm')).toBeInTheDocument();
      expect(screen.getByText(/không đề xuất chế tài/)).toBeInTheDocument();
      expect(screen.queryByText('Gửi cảnh cáo')).not.toBeInTheDocument();
      expect(applyButton()).not.toBeInTheDocument();
    });

    it('never shows sanctions for an unclear verdict, even stored ones', () => {
      renderCard({ sentinelAssessment: { ...assessment, verdict: 'unclear' } });

      expect(screen.getByText('AI kết luận: Chưa rõ')).toBeInTheDocument();
      expect(screen.getByText(/chưa đủ căn cứ/)).toBeInTheDocument();
      expect(screen.queryByText('Gửi cảnh cáo')).not.toBeInTheDocument();
      expect(applyButton()).not.toBeInTheDocument();
    });

    it('asks for a new analysis on an assessment made before verdicts', () => {
      const { verdict: _verdict, ...withoutVerdict } = assessment;
      renderCard({ sentinelAssessment: withoutVerdict });

      expect(screen.getByText('AI kết luận: Chưa rõ')).toBeInTheDocument();
      expect(screen.getByText(/chưa có kết luận của AI/)).toBeInTheDocument();
    });
  });

  it('says how many reports arrived since the AI assessment', () => {
    renderCard({ sentinelAssessment: { ...assessment, newReportsSinceAssessment: 2 } });

    expect(screen.getByText('2 báo cáo mới')).toBeInTheDocument();
  });

  it('shows no notice when nothing arrived since the assessment', () => {
    renderCard({ sentinelAssessment: assessment });

    expect(screen.queryByText(/báo cáo mới/)).not.toBeInTheDocument();
  });

  describe('apply button', () => {
    it('applies only while reviewing', () => {
      renderCard({ status: 'pending', sentinelAssessment: assessment });

      expect(applyButton()).toBeDisabled();
      expect(screen.getByText(/Bắt đầu xử lý ở cuối cửa sổ/)).toBeInTheDocument();
    });

    it('is enabled while a recommended sanction is missing', () => {
      renderCard({ sentinelAssessment: assessment, actions: [{ type: 'warn' }] });

      expect(applyButton()).toBeEnabled();
      expect(screen.getByText(/Chỉ áp dụng các chế tài còn thiếu/)).toBeInTheDocument();
    });

    it('points to the conclusion once every recommended sanction is applied', () => {
      renderCard({ sentinelAssessment: assessment, actions: [{ type: 'warn' }, { type: 'delete_message' }] });

      expect(applyButton()).toBeDisabled();
      expect(screen.getByText(/Kết luận & đóng báo cáo/)).toBeInTheDocument();
    });

    it('is gone on a closed report, with no new analysis', () => {
      renderCard({ status: 'resolved', sentinelAssessment: assessment });

      expect(applyButton()).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Phân tích lại/ })).not.toBeInTheDocument();
    });
  });
});
