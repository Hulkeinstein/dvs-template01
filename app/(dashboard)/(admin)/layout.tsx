import { PropsWithChildren } from 'react';
import ModernAdminSidebar from '@/components/Admin/ModernAdminSidebar';
import ThemeToggle from '@/components/ui/theme-toggle';

// Admin Dashboard 전용 Tailwind CSS
import './admin-tailwind.css';

const AdminLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="admin-v2 dark flex h-screen bg-background">
      {/* 사이드바: 고정 너비 256px (w-64), 전체 높이 */}
      <aside className="w-64 bg-card border-r border-border flex-shrink-0">
        <ModernAdminSidebar />
      </aside>

      {/* 메인 콘텐츠 영역: 남은 공간 전체 사용 */}
      <main className="flex-1 overflow-y-auto">
        {/* 상단 헤더 영역 */}
        <div className="bg-card border-b border-border px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">
              Admin Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {/* 추후 알림, 프로필 등 추가 가능 */}
            </div>
          </div>
        </div>

        {/* 실제 콘텐츠 */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
