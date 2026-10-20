import { cn } from '@/lib/utils';
import { useSidebar } from '@/hooks/useSidebar';
import { Link, useLocation } from 'react-router-dom';
import { type LucideIcon } from 'lucide-react';
import { useUser } from '@repo/store/src/hooks/useUser';

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
  const location = useLocation();
  const { isOpen } = useSidebar();

  return (
    <div className="flex flex-col space-y-1.5 px-2">
      {items.map((item) => {
        const isExternal = item.href.startsWith('http');
        const isActive = location.pathname === item.href;
        const Icon = item.icon;

        const handleClick = () => {
          if (setOpen) setOpen(false);
        };

        const itemContent = (
          <div
            className={cn(
              "group relative flex items-center h-11 px-3 rounded-xl transition-all duration-200 cursor-pointer font-medium text-sm",
              isActive 
                ? "bg-violet-600/20 text-cyan-300 border border-violet-500/30 shadow-md shadow-violet-950/50" 
                : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
            )}
          >
            <div className={cn(
              "flex items-center justify-center transition-transform group-hover:scale-110",
              isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-cyan-300"
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
            {isExternal ? (
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
