import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Wordmark } from '@/components/ui/Wordmark';
import { useAuth } from '@/lib/auth';
import { 
  LayoutDashboard, Search, Database, FileText, 
  Map as MapIcon, BarChart3, Briefcase, Lightbulb, 
  Settings, Users, ShieldAlert, BookOpen
} from 'lucide-react';

export function Sidebar() {
  const { can } = useAuth();
  const location = useLocation();

  const sections = [
    {
      title: 'Discover',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
        { label: 'AI Search', icon: Search, href: '/search' },
        { label: 'Repository', icon: BookOpen, href: '/repository' },
        { label: 'Datasets', icon: Database, href: '/datasets' },
      ]
    },
    {
      title: 'Analyse',
      items: [
        { label: 'Assistant', icon: FileText, href: '/assistant' },
        { label: 'Map Explorer', icon: MapIcon, href: '/map' },
        { label: 'Analytics', icon: BarChart3, href: '/analytics' },
        { label: 'Scenarios', icon: Lightbulb, href: '/scenarios', permission: 'scenario:run' as const },
      ]
    },
    {
      title: 'Collaborate',
      items: [
        { label: 'Workspace', icon: Briefcase, href: '/workspace' },
        { label: 'Innovation', icon: Lightbulb, href: '/innovation' },
      ]
    },
    {
      title: 'Admin',
      permission: 'admin:users' as const,
      items: [
        { label: 'Approval Queue', icon: ShieldAlert, href: '/admin/queue', permission: 'document:approve' as const },
        { label: 'Users & Roles', icon: Users, href: '/admin/users' },
        { label: 'System Health', icon: Settings, href: '/admin/health' },
      ]
    }
  ];

  return (
    <aside className="w-64 border-r border-neutral-200 bg-white flex flex-col h-full shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-neutral-200">
        <Wordmark />
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 space-y-6">
        {sections.map((section) => {
          if (section.permission && !can(section.permission)) return null;

          const visibleItems = section.items.filter(item => !item.permission || can(item.permission));
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="px-4">
              <h3 className="px-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                {section.title}
              </h3>
              <nav className="space-y-1">
                {visibleItems.map((item) => {
                  const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
                  return (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      className={cn(
                        "flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                        isActive 
                          ? "bg-primary-50 text-primary-700" 
                          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                      )}
                    >
                      <item.icon className={cn("mr-3 h-5 w-5 shrink-0", isActive ? "text-primary-600" : "text-neutral-400")} />
                      {item.label}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-neutral-200 text-xs text-neutral-500 text-center">
        BhuNiti Demo
      </div>
    </aside>
  );
}
