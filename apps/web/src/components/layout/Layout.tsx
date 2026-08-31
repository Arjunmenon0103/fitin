import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

export default function Layout() {
  return (
    <div className="min-h-[100dvh] bg-paper">
      <Sidebar />
      <main className="pb-24 md:ml-64 md:pb-10">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
