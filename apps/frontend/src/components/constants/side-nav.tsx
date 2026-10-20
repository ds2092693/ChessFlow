import { 
  PuzzleIcon, 
  LogInIcon, 
  LogOutIcon, 
  SettingsIcon, 
  TrophyIcon, 
  UserIcon,
  BotIcon
} from 'lucide-react';

const BACKEND_URL =
  import.meta.env.VITE_APP_BACKEND_URL ?? 'http://localhost:3000';

export const UpperNavItems = [
  {
    title: 'Play Online',
    icon: PuzzleIcon,
    href: '/game/random',
    colorKey: 'accent',
  },
  {
    title: 'Vs Computer',
    icon: BotIcon,
    href: '/game/computer',
    colorKey: 'accent',
  },
  {
    title: 'Leaderboard',
    icon: TrophyIcon,
    href: '/leaderboard',
    colorKey: 'accent',
  },
  {
    title: 'Profile', 
    icon: UserIcon,
    href: '/profile',
    colorKey: 'accent',
  },
];

export const LowerNavItems = [
  {
    title: 'Themes',
    icon: SettingsIcon,
    href: '/settings/themes',
    colorKey: 'accent',
  },
  {
    title: 'Login',
    icon: LogInIcon,
    href: '/login',
    colorKey: 'accent',
  },
  {
    title: 'Logout',
    icon: LogOutIcon,
    href: `${BACKEND_URL}/auth/logout`,
    colorKey: 'accent',
  },
];
