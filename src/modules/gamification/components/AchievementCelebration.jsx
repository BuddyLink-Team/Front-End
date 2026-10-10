import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, PartyPopper } from 'lucide-react';
import { Modal } from '../../../components/feedback/Modal';
import { Button } from '../../../components/ui/Button';
import { cn } from '../../../utils/cn';
import { useAchievementCelebration } from '../hooks/useAchievementCelebration';
import { BADGE_COLOR_THEMES } from '../constants/gamification.constants';
import { BadgeIcon } from './BadgeIcon';

// Mounted once in the parent layout: congratulates new badges and a longer weekly streak.
export default function AchievementCelebration() {
  const navigate = useNavigate();
  const { isOpen, celebration, close } = useAchievementCelebration();
  if (!isOpen) return null;

  const { badges, streakWeeks } = celebration;

  return (
    <Modal
      isOpen
      onClose={close}
      title={
        <span className="inline-flex items-center gap-2">
          <PartyPopper className="w-5 h-5 stroke-[1.75] text-tertiary-dark" />
          Chúc mừng gia đình bạn!
        </span>
      }
      maxWidth="max-w-md"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={() => {
              close();
              navigate('/gamification');
            }}
          >
            Xem thành tích
          </Button>
          <Button onClick={close}>Tuyệt vời</Button>
        </>
      }
    >
      <div className="space-y-3">
        {streakWeeks > 0 && (
          <div className="flex items-center gap-3 rounded-2xl bg-tertiary-soft border border-tertiary-border p-4 animate-pop-in">
            <div className="w-12 h-12 rounded-full bg-white text-tertiary-dark flex items-center justify-center shrink-0">
              <Flame className="w-6 h-6 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-title-md text-on-surface">Chuỗi {streakWeeks} tuần liên tiếp</p>
              <p className="text-body-md text-on-surface-variant">Tiếp tục hẹn chơi mỗi tuần để giữ chuỗi nhé.</p>
            </div>
          </div>
        )}

        {badges.map((badge) => {
          const theme = BADGE_COLOR_THEMES[badge.code] || BADGE_COLOR_THEMES.default;
          return (
            <div
              key={badge.code}
              className={cn('flex items-center gap-3 rounded-2xl border bg-white p-4 animate-pop-in', theme.border)}
            >
              <BadgeIcon badge={badge} className="w-12 h-12" />
              <div>
                <p className="text-title-md text-on-surface">Huy hiệu “{badge.title}”</p>
                <p className="text-body-md text-on-surface-variant">{badge.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
