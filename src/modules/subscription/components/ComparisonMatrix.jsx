import { Check } from 'lucide-react';
import { DEFAULT_PLAN_BENEFITS } from '../constants/subscription.constants';

export const ComparisonMatrix = () => {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-container-lowest shadow-sm">
      <div className="px-6 py-4 border-b border-outline-variant/40 bg-surface/50">
        <h3 className="text-lg font-bold text-on-surface">
          So sánh quyền lợi chi tiết
        </h3>
        <p className="text-sm text-on-surface-variant">
          Đối chiếu quyền lợi sử dụng giữa gói Miễn phí và gói Hội viên Premium
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-outline-variant/40 bg-surface-container-low/40">
              <th className="py-4 px-6 font-semibold text-on-surface w-1/2 min-w-[200px]">
                Tính năng & Hạn mức
              </th>
              <th className="py-4 px-6 font-semibold text-on-surface text-center w-1/4 min-w-[140px]">
                Gói Miễn Phí
              </th>
              <th className="py-4 px-6 font-bold text-primary text-center w-1/4 min-w-[140px] bg-primary/5">
                Gói Premium ⭐
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {DEFAULT_PLAN_BENEFITS.map((benefit, index) => (
              <tr
                key={benefit.key}
                className={index % 2 === 0 ? 'bg-transparent' : 'bg-surface-container-lowest'}
              >
                <td className="py-4 px-6 font-medium text-on-surface">
                  <div className="flex items-center gap-1.5">
                    <span>{benefit.name}</span>
                    {benefit.isUpcoming && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-normal">
                        Sắp ra mắt
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-4 px-6 text-center text-on-surface-variant">
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    {benefit.freeText}
                  </span>
                </td>
                <td className="py-4 px-6 text-center font-bold text-primary bg-primary/5">
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-primary" />
                    {benefit.premiumText}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparisonMatrix;
