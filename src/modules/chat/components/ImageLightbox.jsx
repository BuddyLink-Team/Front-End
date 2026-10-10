import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

/**
 * Full-size view of a chat image. Clicking the backdrop or the close button closes it.
 *
 * @param {string|null} imageUrl - Image to show; nothing is rendered when empty
 * @param {Function} onClose
 */
export const ImageLightbox = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 chat-lightbox-overlay flex items-center justify-center p-4"
    >
      <div className="relative max-w-3xl max-h-[90vh]">
        <img
          src={imageUrl}
          alt="Full size"
          className="max-h-[85vh] w-auto object-contain rounded-2xl shadow-2xl"
        />
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          aria-label="Đóng ảnh"
          className="absolute -top-3 -right-3 w-8 h-8 p-0 rounded-full bg-white text-on-surface shadow-lg hover:bg-surface-container-low"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default ImageLightbox;
