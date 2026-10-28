import React from 'react';
import PropTypes from 'prop-types';
import { ExternalLink, Baby, Navigation } from 'lucide-react';
import { LINK_CLASS } from '../../playdate/utils/suggestionFormatters';
import { AI_LINK_KINDS, AI_LINK_LABELS } from '../constants/aiAssistantConstants';

const ICONS = {
  [AI_LINK_KINDS.CHILD_PROFILE]: Baby,
  [AI_LINK_KINDS.OSM]: ExternalLink,
  [AI_LINK_KINDS.GOOGLE_MAPS]: Navigation,
};

/**
 * "See more" links of a suggestion: a child's public profile (in the app) or a place on a map (new tab)
 * @param {Array<{ kind: string, href?: string, childId?: string }>} links
 * @param {(childId: string) => void} [onViewChild]
 */
export const OptionLinks = ({ links = [], onViewChild }) => {
  const visible = links.filter((link) => (link.kind === AI_LINK_KINDS.CHILD_PROFILE ? onViewChild && link.childId : link.href));
  if (!visible.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {visible.map((link) => {
        const Icon = ICONS[link.kind] || ExternalLink;
        const label = AI_LINK_LABELS[link.kind] || 'Xem thêm';
        return link.kind === AI_LINK_KINDS.CHILD_PROFILE ? (
          <button key={link.kind} type="button" onClick={() => onViewChild(link.childId)} className={LINK_CLASS}>
            <Icon className="w-3 h-3" /> {label}
          </button>
        ) : (
          <a key={link.kind} href={link.href} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
            <Icon className="w-3 h-3" /> {label}
          </a>
        );
      })}
    </div>
  );
};

OptionLinks.propTypes = {
  links: PropTypes.arrayOf(
    PropTypes.shape({ kind: PropTypes.string.isRequired, href: PropTypes.string, childId: PropTypes.string }),
  ),
  onViewChild: PropTypes.func,
};

export default OptionLinks;
