import React from 'react';
import { ExternalLink, Plus, X } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { Modal } from '../../../components/feedback/Modal';
import { useAIAssistantDrawer } from '../hooks/useAIAssistantDrawer';
import { setActiveAISession } from '../redux/aiAssistantSlice';
import { AIChatPanel } from './AIChatPanel';

const ICON_BUTTON = 'rounded-full p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface';

/**
 * Slide-out assistant from the right, available on every parent page (opened by AIAssistantFab).
 * Same conversation as the full-screen page.
 */
export const AIAssistantDrawer = () => {
  const dispatch = useDispatch();
  const { isOpen, close, openFullScreen } = useAIAssistantDrawer();

  return (
    <Modal isOpen={isOpen} onClose={close} placement="right" maxWidth="max-w-ai-drawer" bodyClassName="p-0 flex flex-col overflow-hidden">
      {isOpen && (
        <div className="flex h-full min-h-0 flex-col">
          <AIChatPanel
            variant="drawer"
            headerActions={
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  aria-label="Cuộc trò chuyện mới"
                  title="Cuộc trò chuyện mới"
                  onClick={() => dispatch(setActiveAISession(null))}
                  className={ICON_BUTTON}
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button type="button" aria-label="Mở toàn màn hình" title="Mở toàn màn hình" onClick={openFullScreen} className={ICON_BUTTON}>
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button type="button" aria-label="Đóng" onClick={close} className={ICON_BUTTON}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            }
          />
        </div>
      )}
    </Modal>
  );
};

export default AIAssistantDrawer;
