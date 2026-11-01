import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Crown } from 'lucide-react';
import { UpgradeButton } from '../../../components/ui/UpgradeButton';
import { QUOTA_MESSAGES } from '../../subscription/constants/subscription.constants';
import { ToolCardFrame } from './ToolCardFrame';
import { AI_CARD_TONES, AI_CARD_TYPES } from '../constants/ai-assistant.constants';

/**
 * Another quota blocks what the parent asked (e.g. no playdate can be created this month)
 * @param {string} feature - QUOTA_FEATURES value
 */
export const QuotaNoticeCard = ({ feature }) => {
  const navigate = useNavigate();
  const text = QUOTA_MESSAGES[feature];

  return (
    <ToolCardFrame
      tone={AI_CARD_TONES[AI_CARD_TYPES.QUOTA_NOTICE]}
      icon={Crown}
      title={text?.title || 'Đã chạm hạn mức gói Miễn phí'}
      className="space-y-2"
    >
      {text?.message && <p className="text-xs text-text-muted">{text.message}</p>}
      <UpgradeButton size="sm" onClick={() => navigate('/subscription')}>
        Nâng cấp Premium
      </UpgradeButton>
    </ToolCardFrame>
  );
};

QuotaNoticeCard.propTypes = {
  feature: PropTypes.string.isRequired,
};

export default QuotaNoticeCard;
