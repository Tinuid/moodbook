import { HashRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { BottomNav } from './components/BottomNav';
import { ToastProvider } from './components/Toast';
import { Heute } from './screens/Heute';
import { Kalender } from './screens/Kalender';
import { EintragDetail } from './screens/EintragDetail';
import { Statistiken } from './screens/Statistiken';
import { Eindosierung } from './screens/Eindosierung';

function Layout() {
  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      {/* HashRouter keeps deep links working on any static host (incl. GitHub
          Pages) and when the PWA is launched offline from the home screen. */}
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Heute />} />
            <Route path="/verlauf" element={<Kalender />} />
            <Route path="/verlauf/:date" element={<EintragDetail />} />
            <Route path="/statistiken" element={<Statistiken />} />
            <Route path="/eindosierung" element={<Eindosierung />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </ToastProvider>
  );
}
