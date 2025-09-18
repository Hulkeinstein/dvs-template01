import { PropsWithChildren } from 'react';
import ModernAdminSidebar from '@/components/Admin/ModernAdminSidebar';

const ModernAdminLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* 사이드바: 고정 너비 256px (w-64), 전체 높이, 흰색 배경 */}
      <aside className="w-64 bg-white shadow-xl border-r border-gray-200 flex-shrink-0">
        <ModernAdminSidebar />
      </aside>

      {/* 메인 콘텐츠 영역: 남은 공간 전체 사용 */}
      <main className="flex-1 overflow-y-auto">
        {/* 상단 헤더 영역 (옵션) */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            {/* 추후 알림, 프로필 등 추가 가능 */}
          </div>
        </div>

        {/* 실제 콘텐츠 */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};

export default ModernAdminLayout;
