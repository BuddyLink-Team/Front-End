import { MoreHorizontal, Shield, Sun, CheckCircle } from 'lucide-react';

const QuickProfileCard = ({ connection }) => {
  if (!connection) {
    return (
      <div className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col items-center justify-center text-center h-[400px]">
        <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-outline text-[32px]">touch_app</span>
        </div>
        <h3 className="font-title-md text-on-surface mb-2">Chưa chọn hồ sơ nào</h3>
        <p className="font-body-md text-on-surface-variant max-w-[200px]">
          Nhấn vào một tài khoản trong danh sách bên trái để xem thông tin nhanh ở đây.
        </p>
      </div>
    );
  }

  // Lấy dữ liệu của người dùng kia (không phải người đang đăng nhập)
  // Trong danh sách, thông thường ta cần biết mình là requester hay recipient
  // Nhưng connection obj đã có sẵn data nếu là thẻ.
  // ConnectionCard đang pass cả connection. 
  // Để đơn giản, ta trích xuất child và parent từ đối tượng.
  const parentData = connection.partnerParent || connection.requesterId || connection.recipientId;
  const childData = parentData?.child || {};

  const nameText = childData?.displayName ? `${childData.displayName} & ${parentData?.fullName}` : parentData?.fullName;
  const age = childData?.dateOfBirth
    ? Math.max(0, Math.floor((Date.now() - new Date(childData.dateOfBirth).getTime()) / (365.25 * 24 * 3600 * 1000)))
    : childData?.age;
  const ageText = age !== undefined && age !== null ? `Bé ${age} tuổi` : '';
  const genderText = childData?.gender === 'boy' ? 'Bé trai' : childData?.gender === 'girl' ? 'Bé gái' : '';
  const addressText = parentData?.location?.area || parentData?.location?.city || 'Chưa cập nhật địa chỉ';
  
  return (
    <div className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-[0_4px_24px_rgba(45,55,72,0.04)] transition-all duration-300">
      <div className="flex items-center justify-between pb-space-sm">
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Hồ sơ xem nhanh</span>
        <button className="w-8 h-8 rounded-full hover:bg-surface-container-low text-on-surface-variant flex items-center justify-center transition-colors" type="button">
          <MoreHorizontal className="w-[18px] h-[18px]" />
        </button>
      </div>

      <div className="flex flex-col items-center text-center mt-2">
        <div className="relative mb-3">
          <img 
            className="w-24 h-24 rounded-full object-cover ring-4 ring-primary-fixed" 
            alt={nameText} 
            src={childData?.avatarUrl || parentData?.avatarUrl || "https://ui-avatars.com/api/?name=" + encodeURIComponent(nameText) + "&background=EAF3EC&color=3d6841"} 
          />
          {parentData?.verification?.isVerifiedParent && (
            <span className="absolute bottom-0 right-0 px-2 py-0.5 rounded-full bg-primary text-on-primary font-label-sm text-[10px] font-bold flex items-center gap-0.5 shadow-sm">
              <span className="material-symbols-outlined text-[12px]">verified</span> 100%
            </span>
          )}
        </div>
        <h3 className="font-headline-md text-headline-md text-on-surface">{nameText}</h3>
        <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
          {[ageText, genderText, addressText].filter(Boolean).join(' • ')}
        </p>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed/40 text-on-primary-fixed font-label-md text-label-md mt-2">
          <Shield className="w-4 h-4 text-primary" />
          <span className="font-semibold">Phụ huynh uy tín xác thực</span>
        </div>
      </div>

      <div className="mt-space-md pt-space-md flex flex-col gap-space-sm border-t border-outline-variant/30">
        {(childData?.interests?.length > 0 || childData?.favoriteActivities?.length > 0) && (
          <div>
            <h4 className="font-label-sm text-label-sm uppercase text-outline tracking-wider font-semibold mb-2">Sở thích & trò chơi bé yêu thích</h4>
            <div className="flex flex-wrap gap-1.5">
              {[...(childData.interests || []), ...(childData.favoriteActivities || [])].map((item, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-full bg-secondary-container/40 text-on-secondary-container font-label-md text-label-md">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {parentData?.preferences?.preferredTimeSlots?.length > 0 && (
          <div>
            <h4 className="font-label-sm text-label-sm uppercase text-outline tracking-wider font-semibold mb-2 mt-2">Thời gian rảnh rỗi thuận tiện</h4>
            <div className="bg-surface-container-low p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun className="text-primary w-5 h-5" />
                <div>
                  <p className="font-label-md text-label-md text-on-surface font-semibold">{parentData.preferences.preferredTimeSlots.join(', ')}</p>
                </div>
              </div>
              <CheckCircle className="text-outline w-5 h-5" />
            </div>
          </div>
        )}

        {parentData?.preferences?.preferredLocations?.length > 0 && (
          <div>
            <h4 className="font-label-sm text-label-sm uppercase text-outline tracking-wider font-semibold mb-2 mt-2">Địa điểm chơi ưa thích</h4>
            <div className="flex flex-col gap-2">
              {parentData.preferences.preferredLocations.map((loc, idx) => (
                <div key={idx} className="flex items-center gap-2 font-body-md text-body-md text-on-surface">
                  <span className="material-symbols-outlined text-secondary text-[18px]">park</span>
                  <span>{loc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-2 pt-space-sm flex items-center gap-2 border-t border-outline-variant/30">
          <button className="flex-1 py-2.5 px-4 rounded-full bg-primary-container text-on-primary font-label-md text-label-md font-semibold hover:scale-[1.01] transition-transform flex items-center justify-center gap-1.5 shadow-[0_2px_8px_rgba(123,174,127,0.35)]" type="button">
            <span className="material-symbols-outlined text-[18px]">outgoing_mail</span>
            <span>Mời bé hẹn chơi</span>
          </button>
          <button className="p-2.5 rounded-full bg-surface-container-low hover:bg-surface-container-high text-on-surface transition-colors" title="Gửi lời chào" type="button">
            <span className="material-symbols-outlined text-[18px]">waving_hand</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickProfileCard;
