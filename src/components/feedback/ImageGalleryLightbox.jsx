import React, { useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Modal } from './Modal';
import { ICON_SIZE } from '../../constants/icon.constants';

const CONTROL_CLASS =
  'absolute p-2 rounded-full bg-surface-container-lowest text-text-primary shadow-dialog hover:bg-surface-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary';

/**
 * Full-screen view of a set of images: back / next (buttons or arrow keys, looping) and the position
 * below the image. Clicking around the image or pressing Escape closes it.
 *
 * @param {string[]} images - Image URLs
 * @param {number|null} index - Image shown; nothing is rendered when null
 * @param {Function} onIndexChange - Receives the next index
 * @param {Function} onClose
 */
export const ImageGalleryLightbox = ({ images, index, onIndexChange, onClose }) => {
  const isOpen = index !== null && Boolean(images[index]);
  const hasMany = images.length > 1;

  const showStep = (step) => onIndexChange((index + step + images.length) % images.length);

  useEffect(() => {
    if (!isOpen || !hasMany) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') onIndexChange((index - 1 + images.length) % images.length);
      if (event.key === 'ArrowRight') onIndexChange((index + 1) % images.length);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasMany, index, images.length, onIndexChange]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-none"
      className="h-full max-h-full bg-transparent border-0 shadow-none rounded-none"
      bodyClassName="p-0 overflow-hidden"
      backdropClassName="bg-text-primary/80"
    >
      <div
        className="relative h-full flex flex-col items-center justify-center gap-3 px-14"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <button type="button" aria-label="Đóng ảnh" onClick={onClose} className={`${CONTROL_CLASS} top-0 right-0`}>
          <X size={ICON_SIZE.XXL} />
        </button>

        {hasMany && (
          <button
            type="button"
            aria-label="Ảnh trước"
            onClick={() => showStep(-1)}
            className={`${CONTROL_CLASS} left-0 top-1/2 -translate-y-1/2`}
          >
            <ChevronLeft size={ICON_SIZE.XXL} />
          </button>
        )}

        <img
          src={images[index]}
          alt={`Ảnh ${index + 1}/${images.length}`}
          className="min-h-0 max-w-full max-h-full object-contain rounded-2xl"
        />

        <span
          aria-live="polite"
          className="shrink-0 px-3 py-1 rounded-full bg-surface-container-lowest text-label-md font-semibold text-text-primary"
        >
          {index + 1}/{images.length}
        </span>

        {hasMany && (
          <button
            type="button"
            aria-label="Ảnh tiếp theo"
            onClick={() => showStep(1)}
            className={`${CONTROL_CLASS} right-0 top-1/2 -translate-y-1/2`}
          >
            <ChevronRight size={ICON_SIZE.XXL} />
          </button>
        )}
      </div>
    </Modal>
  );
};

export default ImageGalleryLightbox;
