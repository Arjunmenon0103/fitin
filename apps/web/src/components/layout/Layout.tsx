import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

export default function Layout() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFDF7' }}>
      <Sidebar />
      <main className="md:ml-64 pb-20 md:pb-8">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
