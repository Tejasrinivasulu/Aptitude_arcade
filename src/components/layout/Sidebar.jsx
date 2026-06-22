import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, FileText, BarChart3, LogOut, X, LifeBuoy, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/student/learn', icon: BookOpen, label: 'Learn' },
  { to: '/student/take-test', icon: FileText, label: 'Take Test' },
  { to: '/student/results', icon: BarChart3, label: 'Results' },
  { to: '/student/profile', icon: User, label: 'Profile' },
  { to: '/student/help', icon: LifeBuoy, label: 'Help' },
];

export default function Sidebar({ open, collapsed, onClose }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-x-0 bottom-0 top-16 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed bottom-0 left-0 top-16 z-50 flex shrink-0 flex-col overflow-hidden border-r border-gray-200 bg-white transition-[width,transform] duration-300 lg:static lg:top-auto lg:h-full ${
          collapsed ? 'w-[72px]' : 'w-64'
        } ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex shrink-0 items-center justify-end border-b border-gray-100 p-2 lg:hidden">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-hidden p-3 lg:pt-4">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  collapsed ? 'justify-center px-0' : ''
                } ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <Icon size={20} className="shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="shrink-0 border-t border-gray-100 p-3">
          <button
            type="button"
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
            className={`flex w-full shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 ${
              collapsed ? 'justify-center px-0' : ''
            }`}
          >
            <LogOut size={20} className="shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
