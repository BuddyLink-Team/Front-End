import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { BellRing } from 'lucide-react';

/**
 * Message posted by BuddyLink itself (e.g. the reminder 24h before a playdate, with its safety notes):
 * centered in the conversation, without a sender bubble or avatar
 */
export const SystemMessage = ({ message }) => (
  <div className="flex justify-center px-4 py-1" role="note">
    <div className="max-w-md rounded-2xl border border-hairline bg-surface-container-low px-4 py-2.5 text-center">
      <p className="flex items-center justify-center gap-1.5 text-label-sm font-semibold text-primary-dark">
        <BellRing className="w-3.5 h-3.5" /> BuddyLink
      </p>
      <p className="mt-1 whitespace-pre-wrap text-left text-label-sm text-on-surface-variant leading-relaxed">{message.content}</p>
      <p className="mt-1 text-label-xs text-outline">{dayjs(message.createdAt).format('HH:mm DD/MM')}</p>
    </div>
  </div>
);

SystemMessage.propTypes = {
  message: PropTypes.shape({
    content: PropTypes.string,
    createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  }).isRequired,
};

export default SystemMessage;
