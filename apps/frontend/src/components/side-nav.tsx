import { cn } from '@/lib/utils';
import { useSidebar } from '@/hooks/useSidebar';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { type LucideIcon } from 'lucide-react';
import { useUser } from '@repo/store/src/hooks/useUser';
import { useSetRecoilState } from 'recoil';
import { userAtom } from '@repo/store/src/atoms/user';

const BACKEND_URL =
  import.meta.env.VITE_APP_BACKEND_URL ?? 'http://localhost:3000';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  colorKey?: string;
  isChidren?: boolean;
  children?: NavItem[];
}

interface SideNavProps {
  items: NavItem[];
  setOpen?: (open: boolean) => void;
  className?: string;
}

export function SideNav({ items, setOpen, className }: SideNavProps) {
  const user = useUser();
  const setUser = useSetRecoilState(userAtom);
  const location = useLocation();
  const navigate = useNavigate();
  const { isOpen } = useSidebar();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (setOpen) setOpen(false);

    try {
      await fetch(`${BACKEND_URL}/auth/logout`, {
        credentials: 'include',
      }).catch(() => null);
    } catch {
      /* ignore offline backend error */
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('chessflow_user');
      localStorage.removeItem('token');
    }
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="flex flex-col space-y-1.5 px-2">
      {items.map((item) => {
        const isLogout = item.title === 'Logout';
        const isExternal = !isLogout && item.href.startsWith('http');
        const isActive = !isLogout && location.pathname === item.href;
        const Icon = item.icon;

        const handleClick = (e: React.MouseEvent) => {
          if (isLogout) {
            handleLogout(e);
            return;
          }
          if (setOpen) setOpen(false);
        };

        const itemContent = (
          <div
            className={cn(
              "group relative flex items-center h-11 px-3 rounded-xl transition-all duration-200 cursor-pointer font-medium text-sm",
              isLogout
                ? "text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10"
                : isActive 
                ? "bg-violet-600/20 text-cyan-300 border border-violet-500/30 shadow-md shadow-violet-950/50" 
                : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
            )}
          >
            <div className={cn(
              "flex items-center justify-center transition-transform group-hover:scale-110",
              isLogout
                ? "text-rose-400 group-hover:text-rose-300"
                : isActive 
                ? "text-cyan-400" 
                : "text-slate-400 group-hover:text-cyan-300"
            )}>
              <Icon className="w-5 h-5 shrink-0" />
            </div>

            <span
              className={cn(
                "ml-3.5 whitespace-nowrap transition-opacity duration-200",
                !isOpen && "hidden lg:inline-block",
                className
              )}
            >
              {item.title}
            </span>

            {isActive && (
              <span className="absolute right-2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
            )}
          </div>
        );

        return (
          <div
            key={item.title}
            hidden={
              (!!user && item.title === 'Login') ||
              (!user && item.title === 'Logout')
            }
          >
            {isLogout ? (
              <button type="button" onClick={handleClick} className="w-full text-left">
                {itemContent}
              </button>
            ) : isExternal ? (
              <a href={item.href} onClick={handleClick}>
                {itemContent}
              </a>
            ) : (
              <Link to={item.href} onClick={handleClick}>
                {itemContent}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
