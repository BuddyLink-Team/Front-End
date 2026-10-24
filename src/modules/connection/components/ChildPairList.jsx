import PropTypes from 'prop-types';
import { Link2 } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { ICON_STROKE } from '../../../constants/icon.constants';
import { CHILD_PAIR_SOURCE_LABELS } from '../constants/connection.constants';

const withAge = (name, age) => (age !== null && age !== undefined ? `${name} (${age} tuổi)` : name);

/**
 * Children paired on a connection: "Bông (5 tuổi) ↔ Bơ".
 * An incoming request reads from the requester's side: "Bông (5 tuổi) ↔ bé Bơ của bạn".
 */
const ChildPairList = ({ pairs, isIncoming = false, showSource = false, className }) => {
  if (!pairs.length) return null;

  return (
    <ul className={cn('space-y-1', className)}>
      {pairs.map((pair) => (
        <li key={pair.key} className="flex items-center gap-1.5 text-sm text-text-primary min-w-0">
          <Link2 className="w-3.5 h-3.5 shrink-0 text-primary" strokeWidth={ICON_STROKE.THIN} />
          <span className="truncate">
            {isIncoming && <span className="text-text-muted">Muốn kết nối: </span>}
            <span className="font-semibold">{withAge(pair.partnerChildName, pair.partnerChildAge)}</span>
            {' ↔ '}
            {isIncoming ? (
              <>
                bé <span className="font-semibold">{pair.myChildName}</span> của bạn
              </>
            ) : (
              <span className="font-semibold">{pair.myChildName}</span>
            )}
          </span>
          {showSource && CHILD_PAIR_SOURCE_LABELS[pair.source] && (
            <span className="ml-1 shrink-0 text-label-xs text-text-muted">· {CHILD_PAIR_SOURCE_LABELS[pair.source]}</span>
          )}
        </li>
      ))}
    </ul>
  );
};

ChildPairList.propTypes = {
  pairs: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      myChildName: PropTypes.string.isRequired,
      partnerChildName: PropTypes.string.isRequired,
      partnerChildAge: PropTypes.number,
      source: PropTypes.string,
    })
  ).isRequired,
  isIncoming: PropTypes.bool,
  showSource: PropTypes.bool,
  className: PropTypes.string,
};

export default ChildPairList;
