import React, { useEffect, useState } from 'react';
import { Eye, Flag } from 'lucide-react';
import { ImageGalleryLightbox } from '../../../../components/feedback/ImageGalleryLightbox';
import { ICON_SIZE } from '../../../../constants/icon.constants';
import { getReportCategoryLabel } from '../../constants/admin.constants';
import { ReportSection } from './ReportChips';

/**
 * What the reporter wrote (the description is the text proof) and the evidence images
 */
export const ReportContentPanel = ({ report }) => {
  const [previewIndex, setPreviewIndex] = useState(null);
  const evidenceUrls = report.evidenceUrls || [];

  useEffect(() => {
    setPreviewIndex(null);
  }, [report.id]);

  return (
    <ReportSection icon={Flag} title="Nội dung báo cáo">
      <div className="flex items-center justify-between border-b border-hairline pb-2">
        <span className="text-text-muted">Danh mục:</span>
        <span className="font-semibold text-text-primary">{getReportCategoryLabel(report.category)}</span>
      </div>
      <div>
        <span className="text-text-muted text-label-sm">Lý do báo cáo:</span>
        <p className="font-medium text-text-primary mt-0.5">{report.reason || '—'}</p>
      </div>
      {report.description && (
        <div>
          <span className="text-text-muted text-label-sm">Mô tả chi tiết:</span>
          <p className="text-text-primary mt-0.5 whitespace-pre-line bg-surface p-3 rounded-xl border border-hairline">
            {report.description}
          </p>
        </div>
      )}
      {evidenceUrls.length > 0 && (
        <div className="pt-2 border-t border-hairline space-y-2">
          <span className="text-text-muted text-label-sm">Bằng chứng hình ảnh ({evidenceUrls.length}):</span>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {evidenceUrls.map((url, index) => (
              <button
                key={url}
                type="button"
                aria-label={`Xem bằng chứng ${index + 1}`}
                onClick={() => setPreviewIndex(index)}
                className="relative aspect-square rounded-xl overflow-hidden border border-hairline group focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <img src={url} alt={`Bằng chứng ${index + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-surface-container-lowest opacity-0 group-hover:opacity-70 flex items-center justify-center transition-opacity">
                  <Eye size={ICON_SIZE.SM} className="text-text-primary" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <ImageGalleryLightbox
        images={evidenceUrls}
        index={previewIndex}
        onIndexChange={setPreviewIndex}
        onClose={() => setPreviewIndex(null)}
      />
    </ReportSection>
  );
};

export default ReportContentPanel;
