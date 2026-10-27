import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { Copy, RotateCcw, Zap, Check } from 'lucide-react';
import { ChatBubble } from '../../../components/chat/ChatBubble';
import { useToast } from '../../../hooks/useToast';
import { AIMascotAvatar } from './AIMascotAvatar';
import { AITextContent } from './AITextContent';
import { ToolCardList } from './ToolCardList';
import { plainAIText } from '../utils/aiAssistantUtils';
import {
  AI_ERROR_CODES,
  AI_ERROR_MESSAGES,
  AI_MESSAGE_STATUS,
  AI_NON_RETRYABLE_ERRORS,
  TOOL_LABELS,
} from '../constants/aiAssistantConstants';

const timeOf = (message) => (message.createdAt ? dayjs(message.createdAt).format('HH:mm') : '');

const ToolsUsedChip = ({ tools }) => {
  const labels = [...new Set(tools.map((tool) => TOOL_LABELS[tool]).filter(Boolean))];
  if (!labels.length) return null;
  return (
    <p className="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-secondary-border bg-secondary-soft px-2.5 py-1 text-label-sm text-secondary-dark">
      <Zap className="w-3 h-3" />
      Đã dùng: {labels.join(' · ')}
    </p>
  );
};

ToolsUsedChip.propTypes = { tools: PropTypes.arrayOf(PropTypes.string).isRequired };

const FailedMeta = ({ message, onRetry, onStartNew }) => {
  const code = message.errorCode;
  const text = AI_ERROR_MESSAGES[code] || 'Không gửi được tin nhắn.';
  return (
    <span className="flex flex-wrap items-center gap-2 text-error">
      {text}
      {code === AI_ERROR_CODES.QUOTA_EXCEEDED && (
        <Link to="/subscription" className="font-semibold text-primary-dark hover:underline">
          Nâng cấp Premium
        </Link>
      )}
      {code === AI_ERROR_CODES.AI_SESSION_FULL && onStartNew && (
        <button type="button" onClick={onStartNew} className="font-semibold text-primary-dark hover:underline">
          Mở cuộc trò chuyện mới
        </button>
      )}
      {!AI_NON_RETRYABLE_ERRORS.includes(code) && (
        <button
          type="button"
          onClick={() => onRetry(message)}
          className="inline-flex items-center gap-1 font-semibold text-primary-dark hover:underline"
        >
          <RotateCcw className="w-3 h-3" /> Thử lại
        </button>
      )}
    </span>
  );
};

FailedMeta.propTypes = {
  message: PropTypes.object.isRequired,
  onRetry: PropTypes.func.isRequired,
  onStartNew: PropTypes.func,
};

/**
 * One message of the conversation: the parent's (right) or the assistant's (mascot, text, Tool UI Cards)
 *
 * @param {Object} message
 * @param {boolean} [isSending] - A message is being sent (cards are locked meanwhile)
 * @param {Function} onRetry - Send a failed message again
 * @param {Function} [onStartNew] - Open a new conversation (when this one is full)
 * @param {Object} cardHandlers - onChoose, onViewChild, onUsePlace, isPlanActive, latestDraftMessageId (see ToolCardList)
 */
export const MessageBubble = ({ message, isSending = false, onRetry, onStartNew, cardHandlers }) => {
  const toast = useToast();

  if (message.role === 'user') {
    const isFailed = message.status === AI_MESSAGE_STATUS.FAILED;
    // The message and the reply come back in one response: while it is pending the typing indicator
    // shows the assistant at work, so the message itself looks sent (it turns failed if the request fails)
    return (
      <ChatBubble
        isOutgoing
        hasError={isFailed}
        meta={isFailed ? <FailedMeta message={message} onRetry={onRetry} onStartNew={onStartNew} /> : <span>{timeOf(message)}</span>}
      >
        {message.choice && <Check className="mr-1.5 inline w-3.5 h-3.5 text-primary-dark" aria-label="Đã chọn" />}
        <span className="whitespace-pre-wrap">{message.content}</span>
      </ChatBubble>
    );
  }

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(plainAIText(message.content));
      toast.success('Đã sao chép câu trả lời.');
    } catch {
      toast.error('Không thể sao chép.');
    }
  };

  return (
    <ChatBubble
      avatar={<AIMascotAvatar size="sm" />}
      className="max-w-full sm:max-w-full"
      bubbleClassName="max-w-ai-thread"
      attachments={
        message.cards?.length > 0 ? <ToolCardList message={message} disabled={isSending} {...cardHandlers} /> : null
      }
      meta={
        <>
          <span>{timeOf(message)}</span>
          <button
            type="button"
            onClick={copyText}
            aria-label="Sao chép câu trả lời"
            className="ml-1 rounded p-0.5 hover:bg-surface-muted hover:text-text-primary"
          >
            <Copy className="w-3 h-3" />
          </button>
        </>
      }
    >
      {message.toolsUsed?.length > 0 && <ToolsUsedChip tools={message.toolsUsed} />}
      <AITextContent text={message.content} />
    </ChatBubble>
  );
};

MessageBubble.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.string.isRequired,
    role: PropTypes.oneOf(['user', 'assistant']).isRequired,
    content: PropTypes.string.isRequired,
    cards: PropTypes.array,
    toolsUsed: PropTypes.arrayOf(PropTypes.string),
    choice: PropTypes.object,
    status: PropTypes.string,
    errorCode: PropTypes.string,
    createdAt: PropTypes.string,
  }).isRequired,
  isSending: PropTypes.bool,
  onRetry: PropTypes.func.isRequired,
  onStartNew: PropTypes.func,
  cardHandlers: PropTypes.shape({
    onChoose: PropTypes.func.isRequired,
    onViewChild: PropTypes.func.isRequired,
    onUsePlace: PropTypes.func.isRequired,
    isPlanActive: PropTypes.bool,
    latestDraftMessageId: PropTypes.string,
  }).isRequired,
};

export default MessageBubble;
