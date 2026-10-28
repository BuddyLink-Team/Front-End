import React, { useState } from 'react';
import { History } from 'lucide-react';
import { Modal } from '../../../components/feedback/Modal';
import { AIChatPanel } from '../components/AIChatPanel';
import { SessionList } from '../components/SessionList';
import { useAISessionUrlSync } from '../hooks/useAISessionUrlSync';

/**
 * /ai-assistant — full-screen assistant: conversation history on the left (a sheet on small screens),
 * the conversation on the right.
 */
export const AIAssistantPage = () => {
  useAISessionUrlSync();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <div className="chat-layout-height w-full flex gap-4 overflow-hidden">
      <aside className="hidden lg:flex w-chat-panel shrink-0 flex-col overflow-hidden rounded-2xl border border-hairline bg-surface-container-lowest">
        <SessionList />
      </aside>

      <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-hairline bg-surface-container-lowest">
        <AIChatPanel
          variant="page"
          headerActions={
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              aria-label="Lịch sử trò chuyện"
              className="lg:hidden rounded-full p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
            >
              <History className="w-5 h-5" />
            </button>
          }
        />
      </section>

      <Modal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title="Lịch sử trò chuyện"
        placement="sheet"
        bodyClassName="p-0"
      >
        <SessionList onSelected={() => setIsHistoryOpen(false)} />
      </Modal>
    </div>
  );
};

export default AIAssistantPage;
