import React from 'react';
import { Check, ShieldCheck } from 'lucide-react';
import { Input } from '../../../components';
import { GENDER_OPTIONS } from '../constants/childConstants';

export const ChildBasicInfoStep = ({ formData, formErrors, updateField }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Child Name */}
      <div>
        <Input
          id="child-name"
          label="Tên gọi hoặc Biệt danh của bé"
          placeholder="VD: Bé Bơ, Minh Khôi, Sam Sam..."
          value={formData.displayName}
          onChange={(e) => updateField('displayName', e.target.value)}
          error={formErrors.displayName}
          required
        />
      </div>

      {/* Date of Birth & Gender Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Input
            id="child-dob"
            type="date"
            label="Ngày sinh của bé"
            value={formData.dateOfBirth}
            onChange={(e) => updateField('dateOfBirth', e.target.value)}
            error={formErrors.dateOfBirth}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1.5">
            Giới tính của bé <span className="text-error">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {GENDER_OPTIONS.map((g) => {
              const isSelected = formData.gender === g.value;
              return (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => updateField('gender', g.value)}
                  className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all border flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-surface-container-low text-on-surface-variant border-hairline hover:bg-surface-container'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  <span>{g.label}</span>
                </button>
              );
            })}
          </div>
          {formErrors.gender && (
            <p className="text-xs text-error mt-1">{formErrors.gender}</p>
          )}
        </div>
      </div>

      {/* Privacy Guarantee Note */}
      <div className="p-4 rounded-2xl bg-surface-container-low/60 border border-hairline flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-text-muted leading-relaxed">
          BuddyLink cam kết bảo vệ thông tin trẻ em. Tên và hình ảnh của con chỉ hiển thị với các phụ huynh đã xác thực danh tính trên nền tảng.
        </p>
      </div>
    </div>
  );
};

export default ChildBasicInfoStep;
