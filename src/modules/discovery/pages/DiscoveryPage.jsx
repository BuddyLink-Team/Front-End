import React from 'react';
import { Card } from '../../../components/cards/Card';
import { VerifiedBadge } from '../../../components/badges/VerifiedBadge';
import { InterestTag } from '../../../components/badges/InterestTag';
import { Button } from '../../../components/ui/Button';
import { SearchBar } from '../../../components/search/SearchBar';
import { MapPin, Users } from 'lucide-react';

export const DiscoveryPage = () => {
  return (
    <div className="space-y-6">
      {/* Search & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Khám phá bạn chơi lân cận
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Gợi ý các bé có cùng độ tuổi, sở thích và khoảng cách gần nhất
          </p>
        </div>
        <div className="w-full sm:w-72">
          <SearchBar />
        </div>
      </div>

      {/* Discovery List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card hoverable className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center font-bold text-secondary text-lg">
                B
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Bé Bo (5 tuổi)</h3>
                <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" /> Cách 1.2 km • Quận 7
                </p>
              </div>
            </div>
            <VerifiedBadge size="sm" />
          </div>

          <p className="text-sm text-text-muted line-clamp-2">
            Bé rất thích lắp ráp Lego, vẽ tranh và các trò chơi vận động ngoài trời.
          </p>

          <div className="flex flex-wrap gap-1.5">
            <InterestTag label="Lego" />
            <InterestTag label="Vẽ tranh" />
            <InterestTag label="Đá bóng" />
          </div>

          <div className="pt-2 border-t border-hairline flex items-center justify-between">
            <span className="text-xs text-text-muted flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Mẹ Lan Anh
            </span>
            <Button size="sm">Hẹn chơi</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DiscoveryPage;
