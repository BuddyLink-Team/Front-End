import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { parseAIText } from '../utils/aiAssistantUtils';

const Segments = ({ segments }) =>
  segments.map((segment, index) => {
    if (segment.href) {
      return (
        <Link key={index} to={segment.href} className="font-semibold text-primary-dark underline underline-offset-2 hover:text-primary-ink">
          {segment.text}
        </Link>
      );
    }
    return segment.bold ? (
      <strong key={index} className="font-semibold text-text-primary">
        {segment.text}
      </strong>
    ) : (
      <React.Fragment key={index}>{segment.text}</React.Fragment>
    );
  });

/**
 * Assistant text: paragraphs, bullet lists, **bold** and [[section]] links, rendered as React nodes (never as HTML)
 * @param {string} text
 */
export const AITextContent = ({ text }) => {
  const blocks = useMemo(() => parseAIText(text), [text]);

  return (
    <div className="space-y-2">
      {blocks.map((block, index) =>
        block.type === 'list' ? (
          <ul key={index} className="list-disc pl-5 space-y-1">
            {block.items.map((segments, itemIndex) => (
              <li key={itemIndex}>
                <Segments segments={segments} />
              </li>
            ))}
          </ul>
        ) : (
          <p key={index}>
            {block.lines.map((segments, lineIndex) => (
              <React.Fragment key={lineIndex}>
                {lineIndex > 0 && <br />}
                <Segments segments={segments} />
              </React.Fragment>
            ))}
          </p>
        ),
      )}
    </div>
  );
};

AITextContent.propTypes = {
  text: PropTypes.string.isRequired,
};

export default AITextContent;
