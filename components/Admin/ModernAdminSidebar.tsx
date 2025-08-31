'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  UserCheck,
  FolderOpen,
  MessageSquare,
  DollarSign,
  CreditCard,
  Shield,
  Settings,
  BookOpen,
  Award,
  BarChart3,
  FileText,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigation: NavSection[] = [
  {
    title: 'Main',
    items: [
      {
        title: 'Dashboard',
        href: '/admin-dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'Analytics',
        href: '/admin-analytics',
        icon: BarChart3,
      },
    ],
  },
  {
    title: 'User Management',
    items: [
      {
        title: 'All Users',
        href: '/admin-users',
        icon: Users,
      },
      {
        title: 'Instructors',
        href: '/admin-instructors',
        icon: UserCheck,
      },
      {
        title: 'Students',
        href: '/admin-students',
        icon: GraduationCap,
      },
      {
        title: 'Roles & Permissions',
        href: '/admin-roles',
        icon: Shield,
      },
    ],
  },
  {
    title: 'Course Management',
    items: [
      {
        title: 'All Courses',
        href: '/admin-courses',
        icon: BookOpen,
      },
      {
        title: 'Pending Approval',
        href: '/admin-pending-courses',
        icon: FileText,
        badge: 3,
      },
      {
        title: 'Categories',
        href: '/admin-categories',
        icon: FolderOpen,
      },
      {
        title: 'Reviews',
        href: '/admin-reviews',
        icon: MessageSquare,
      },
    ],
  },
  {
    title: 'Financial',
    items: [
      {
        title: 'Revenue',
        href: '/admin-revenue',
        icon: DollarSign,
      },
      {
        title: 'Transactions',
        href: '/admin-transactions',
        icon: CreditCard,
      },
      {
        title: 'Certificates',
        href: '/admin-certificates',
        icon: Award,
      },
    ],
  },
  {
    title: 'System',
    items: [
      {
        title: 'Settings',
        href: '/admin-settings',
        icon: Settings,
      },
    ],
  },
];

const ModernAdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userName = session?.user?.name || 'Admin';

  return (
    <div className="flex flex-col h-full bg-[#111111]">
      {/* Logo/Header */}
      <div className="px-6 py-6 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#fafafa]">Admin Panel</h2>
            <p className="text-sm text-[#a1a1a1]">Welcome, {userName}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6">
        {navigation.map((section, sectionIdx) => (
          <div key={sectionIdx} className={sectionIdx > 0 ? 'mt-8' : ''}>
            <h3 className="px-6 mb-3 text-xs font-semibold text-[#6a6a6a] uppercase tracking-wider">
              {section.title}
            </h3>
            <div className="space-y-1 px-3">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 text-base font-medium rounded-lg transition-all duration-200',
                      isActive
                        ? 'bg-[#1f1f1f] text-blue-400 border-l-4 border-blue-500'
                        : 'text-[#a1a1a1] hover:bg-[#1a1a1a] hover:text-[#fafafa]'
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="flex-1">{item.title}</span>
                    {item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[#2a2a2a]">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#6a6a6a]">v1.0.0</span>
          <Link
            href="/admin-help"
            className="text-sm text-blue-400 hover:text-blue-300 font-medium"
          >
            Need Help?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ModernAdminSidebar;