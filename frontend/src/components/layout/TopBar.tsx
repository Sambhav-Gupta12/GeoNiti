import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchInput } from '@/components/ui/SearchInput';
import { Badge } from '@/components/ui/Badge';
import { Bell, LogOut, User as UserIcon } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { useAuth } from '@/lib/auth';

export function TopBar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const q = e.currentTarget.value;
      if (q.trim()) navigate(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <header className="h-16 border-b border-neutral-200 bg-white flex items-center justify-between px-6 shrink-0">
      <div className="w-96">
        <SearchInput placeholder="Search everywhere (Press Enter)..." onKeyDown={handleSearch} />
      </div>
      
      <div className="flex items-center space-x-4">
        {user && (
          <Badge variant="primary" className="hidden sm:inline-flex">
            {user.role.replace('_', ' ')}
          </Badge>
        )}
        <IconButton icon={Bell} variant="ghost" aria-label="Notifications" />
        <div className="h-8 w-px bg-neutral-200 mx-2" />
        
        {user ? (
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600">
              <UserIcon className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-neutral-700 hidden sm:block">
              {user.first_name} {user.last_name}
            </span>
            <IconButton icon={LogOut} variant="ghost" size="sm" onClick={logout} aria-label="Log out" />
          </div>
        ) : (
          <button onClick={() => navigate('/login')} className="text-sm font-medium text-primary-600 hover:underline">
            Log in
          </button>
        )}
      </div>
    </header>
  );
}
