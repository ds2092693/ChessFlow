import './App.css';
import './themes.css';

import { Suspense, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useParams, useLocation, useNavigate } from 'react-router-dom';
import { RecoilRoot, useRecoilState } from 'recoil';

import { Loader } from './components/Loader';
import { Layout } from './layout';
import { Themes } from './components/themes';
import { ThemesProvider } from './context/themeContext';

import { Landing } from './screens/Landing';
import { Game } from './screens/Game';
import { ComputerGame } from './screens/ComputerGame';
import Login from './screens/Login';
import { Settings } from './screens/Settings';
import { Profile } from './screens/Profile';

import Leaderboard from './components/Leaderboard';
import GameHistory from './components/GameHistory';
import PlayerStats from './components/PlayerStats';
import { userAtom, User } from '@repo/store/src/atoms/user';

function GameHistoryRoute() {
  const { userId } = useParams<{ userId: string }>();
  return <GameHistory userId={userId ?? ''} />;
}

function PlayerStatsRoute() {
  const { userId } = useParams<{ userId: string }>();
  return <PlayerStats userId={userId ?? ''} />;
}

function AuthSync() {
  const [, setUser] = useRecoilState(userAtom);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('auth') === 'success') {
      const token = params.get('token');
      const userId = params.get('userId');
      const name = params.get('name') || 'Grandmaster';
      const provider = params.get('provider') || 'GOOGLE';

      if (token && userId) {
        const u: User = {
          id: userId,
          name,
          token,
          provider,
          isGuest: false,
        };
        localStorage.setItem('chessflow_user', JSON.stringify(u));
        setUser(u);
        navigate('/', { replace: true });
      }
    }
  }, [location.search, navigate, setUser]);

  return null;
}

function App() {
  return (
    <div className="min-h-screen bg-bgMain text-textMain">
      <RecoilRoot>
        <Suspense fallback={<Loader />}>
          <ThemesProvider>
            <BrowserRouter>
              <AuthSync />
              <Routes>
                <Route path="/" element={<Layout><Landing /></Layout>} />
                <Route path="/login" element={<Login />} />
                <Route path="/game/:gameId" element={<Layout><Game /></Layout>} />
                <Route path="/game/computer" element={<Layout><ComputerGame /></Layout>} />
                <Route path="/settings" element={<Layout><Settings /></Layout>}>
                  <Route path="themes" element={<Themes />} />
                </Route>
                <Route path="/leaderboard" element={<Layout><Leaderboard /></Layout>} />
                <Route path="/profile" element={<Layout><Profile /></Layout>} />
                <Route path="/history/:userId" element={<Layout><GameHistoryRoute /></Layout>} />
                <Route path="/stats/:userId" element={<Layout><PlayerStatsRoute /></Layout>} />
              </Routes>
            </BrowserRouter>
          </ThemesProvider>
        </Suspense>
      </RecoilRoot>
    </div>
  );
}

export default App;
