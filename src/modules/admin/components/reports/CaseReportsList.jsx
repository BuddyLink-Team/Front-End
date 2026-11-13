import React, { useEffect, useState } from 'react';
import { Eye, Flag } from 'lucide-react';
import { Avatar } from '../../../../components/ui/Avatar';
import { ImageGalleryLightbox } from '../../../../components/feedback/ImageGalleryLightbox';
import { ICON_SIZE } from '../../../../constants/icon.constants';
import { formatDateTime } from '../../../../utils/formatters';
import { ReportSection } from './ReportChips';

/**
 * Every report of the case, as each parent wrote it: who, when, the reason, the description and the
 * evidence images.
 */
export const CaseReportsList = ({ report }) => {
  // { images, index } of the evidence being viewed
  const [preview, setPreview] = useState(null);
  const reports = report.caseReports?.length
    ? report.caseReports
    : [
        {
          id: report.id,
          reporter: report.reporter,
          reason: report.reason,
          description: report.description,
          evidenceUrls: report.evidenceUrls,
          createdAt: report.createdAt,
        },
      ];

  useEffect(() => {
    setPreview(null);
  }, [report.id]);

  return (
    <ReportSection icon={Flag} title={`Các báo cáo (${reports.length})`}>
      <ul className="divide-y divide-hairline">
        {reports.map((item) => {
          const images = item.evidenceUrls || [];
          return (
            <li key={item.id} className="space-y-2 py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-2.5">
                <Avatar
                  src={item.reporter?.avatarUrl}
                  alt={item.reporter?.fullName}
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="font-semibold text-text-primary break-words">
                    {item.reporter?.fullName || 'Người dùng'}
                  </p>
                  <p className="text-label-sm text-text-muted">
                    {formatDateTime(item.createdAt)}
                  </p>
                </div>
              </div>
              <p className="font-medium text-text-primary">{item.reason || '—'}</p>
              {item.description && (
                <p className="whitespace-pre-line rounded-xl border border-hairline bg-surface p-3 text-text-primary">
                  {item.description}
                </p>
              )}
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {images.map((url, index) => (
                    <button
                      key={url}
                      type="button"
                      aria-label={`Xem bằng chứng ${index + 1}`}
                      onClick={() => setPreview({ images, index })}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-hairline focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <img
                        src={url}
                        alt={`Bằng chứng ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-surface-container-lowest opacity-0 transition-opacity group-hover:opacity-70">
                        <Eye size={ICON_SIZE.SM} className="text-text-primary" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <ImageGalleryLightbox
        images={preview?.images || []}
        index={preview ? preview.index : null}
        onIndexChange={(index) =>
          setPreview((current) => (current ? { ...current, index } : current))
        }
        onClose={() => setPreview(null)}
      />
    </ReportSection>
  );
};

export default CaseReportsList;
