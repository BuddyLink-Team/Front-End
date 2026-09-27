import { Compass, Calendar, MessageCircle, Sparkles } from 'lucide-react';

/**
 * Main navigation links for parents on the top navigation bar.
 */
export const NAV_LINKS = [
  { name: 'Khám phá', href: '/discovery', icon: Compass },
  { name: 'Cuộc hẹn', href: '/playdates', icon: Calendar },
  { name: 'Trò chuyện', href: '/chat', icon: MessageCircle },
  { name: 'Trợ lý AI', href: '/ai-assistant', icon: Sparkles },
];
