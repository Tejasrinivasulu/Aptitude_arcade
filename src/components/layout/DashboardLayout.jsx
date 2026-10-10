import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import WeekendWindowNoticeModal from '../dashboard/WeekendWindowNoticeModal';
import { isCatchupActive } from '../../data/testSchedule';
import { ArrowRight } from 'lucide-react';

const SESSION_STORAGE_KEY = 'arcade_weekend_window_notice_v1';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (isCatchupActive() && !sessionStorage.getItem(SESSION_STORAGE_KEY)) {
      setModalOpen(true);
    }
  }, []);

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => !prev);
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f8fafc]">
      {/* Persistent Top Announcement Bar during Weekend Catch-Up Window */}
      {isCatchupActive() && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between gap-3 shadow-xs shrink-0 z-50">
          <div className="flex items-center gap-2 mx-auto flex-wrap justify-center text-center">
            <span className="flex h-2 w-2 rounded-full bg-emerald-300 animate-pulse shrink-0" />
            <span>
              <strong>✨ Weekend Catch-Up Window LIVE:</strong> All tests (Days 1–12) are open until Sunday 11:59 PM IST!
            </span>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="ml-2 inline-flex items-center gap-1 underline font-bold text-emerald-200 hover:text-white transition-colors cursor-pointer"
            >
              <span>View Announcement</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      )}

      <Navbar onMenuClick={toggleSidebar} />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar
          open={sidebarOpen}
          collapsed={sidebarCollapsed}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
      <WeekendWindowNoticeModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
