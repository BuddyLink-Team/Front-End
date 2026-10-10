import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useParentProfile } from '../hooks/useParentProfile';
import { PROFILE_TABS, TAB_CONFIGS } from '../constants/parentConstants';
import {
  ProfileHeaderCard,
  ProfileInfoTab,
  ProfilePreferencesTab,
  ProfileSecurityTab,
} from '../components';
import { Spinner, Button, Tabs } from '../../../components';

export const ParentProfilePage = () => {
  const [activeTab, setActiveTab] = useState(PROFILE_TABS.INFO);

  const {
    profile,
    children,
    isLoading,
    isUpdating,
    isUploadingAvatar,
    errorMessage,
    fetchProfileData,
    updateProfile,
    uploadAvatar,
    changePassword,
  } = useParentProfile();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm font-medium text-text-muted">
          Đang tải hồ sơ phụ huynh...
        </p>
      </div>
    );
  }

  if (errorMessage && !profile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="p-4 rounded-2xl bg-error/10 text-error max-w-md">
          <p className="text-sm font-medium">{errorMessage}</p>
        </div>
        <Button
          type="button"
          onClick={fetchProfileData}
          className="rounded-xl px-5 py-2.5 text-xs font-semibold"
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Thử tải lại trang
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full py-4 space-y-6">
      {/* 2-Column Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (4 cols on lg): Sticky Profile Sidebar Card */}
        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <ProfileHeaderCard
            profile={profile}
            childrenCount={children.length}
            onAvatarUpload={uploadAvatar}
            isUploadingAvatar={isUploadingAvatar}
          />
        </div>

        {/* Right Column (8 cols on lg): Horizontal Tabs & Main Content Panel */}
        <div className="lg:col-span-8 space-y-2 min-w-0">
          {/* Horizontal Navigation Tabs */}
          <Tabs tabs={TAB_CONFIGS} activeTab={activeTab} onChange={setActiveTab} fullWidth />

          {/* Active Tab Content */}
          <div className="transition-all duration-300">
            {activeTab === PROFILE_TABS.INFO && (
              <ProfileInfoTab
                profile={profile}
                onUpdate={updateProfile}
                isUpdating={isUpdating}
              />
            )}

            {activeTab === PROFILE_TABS.PREFERENCES && (
              <ProfilePreferencesTab
                profile={profile}
                onUpdate={updateProfile}
                isUpdating={isUpdating}
              />
            )}

            {activeTab === PROFILE_TABS.SECURITY && (
              <ProfileSecurityTab
                profile={profile}
                onUpdate={updateProfile}
                isUpdating={isUpdating}
                onChangePassword={changePassword}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentProfilePage;
