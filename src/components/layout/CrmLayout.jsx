import React, { useContext, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { LayoutDashboard, KanbanSquare, CalendarDays, Menu, X, ChevronLeft } from 'lucide-react';
import Header from './Header';

const CrmLayout = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  const adminLinks = [
    { to: '/admin/crm', label: 'Overview', shortLabel: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/crm/pipeline', label: 'Global Pipeline', shortLabel: 'G.Pipeline', icon: KanbanSquare },
    { to: '/admin/crm/calendar', label: 'Global Calendar', shortLabel: 'G.Calendar', icon: CalendarDays },
    { to: '/executive/crm/pipeline', label: 'My Pipeline', shortLabel: 'Pipeline', icon: KanbanSquare },
    { to: '/executive/crm/calendar', label: 'My Calendar', shortLabel: 'Calendar', icon: CalendarDays },
  ];

  const executiveLinks = [
    { to: '/executive/crm/pipeline', label: 'My Pipeline', shortLabel: 'Pipeline', icon: KanbanSquare },
    { to: '/executive/crm/calendar', label: 'My Calendar', shortLabel: 'Calendar', icon: CalendarDays },
  ];

  const links = isAdmin ? adminLinks : executiveLinks;

  const isActive = (link) =>
    link.end ? location.pathname === link.to : location.pathname.startsWith(link.to);

  // Bottom nav shows top 4 links max on mobile
  const bottomLinks = links.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      {/* Mobile full-screen nav drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
          />
          {/* Drawer panel */}
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-primary-700 to-primary-600">
              <div>
                <h2 className="text-base font-bold text-white">CRM</h2>
                <p className="text-xs text-primary-200 mt-0.5">{isAdmin ? 'Admin Console' : 'Executive Portal'}</p>
              </div>
              <button
                onClick={() => setMobileNavOpen(false)}
                className="p-2 text-white/80 hover:text-white rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                const active = isActive(link);
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileNavOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-sm ${
                      active
                        ? 'bg-primary-50 text-primary-700 border border-primary-100'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={18} className={active ? 'text-primary-600' : 'text-gray-400'} />
                    {link.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      <div className="flex flex-1 pt-16">
        {/* ── Desktop Sidebar ─────────────────────────────────────────── */}
        <aside
          className={`hidden lg:flex flex-col bg-white border-r border-gray-100 fixed top-16 bottom-0 left-0 z-10 transition-all duration-300 ${
            sidebarCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          {/* Sidebar header */}
          <div className={`flex items-center border-b border-gray-100 shrink-0 ${sidebarCollapsed ? 'p-3 justify-center' : 'p-4 justify-between'}`}>
            {!sidebarCollapsed && (
              <div>
                <h2 className="text-sm font-bold text-gray-800">CRM</h2>
                <p className="text-xs text-gray-400 mt-0.5">{isAdmin ? 'Admin Console' : 'Executive Portal'}</p>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title={sidebarCollapsed ? 'Expand' : 'Collapse'}
            >
              <ChevronLeft size={16} className={`transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 overflow-y-auto p-2 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const active = isActive(link);
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  title={sidebarCollapsed ? link.label : undefined}
                  className={`flex items-center rounded-xl font-medium transition-all text-sm ${
                    sidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'
                  } ${
                    active
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} className={`shrink-0 ${active ? 'text-primary-600' : 'text-gray-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">{link.label}</span>}
                </NavLink>
              );
            })}
          </nav>
        </aside>

        {/* ── Main Content ─────────────────────────────────────────────── */}
        <main
          className={`flex-1 min-h-[calc(100vh-64px)] overflow-y-auto transition-all duration-300 ${
            sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
          } pb-20 lg:pb-0`}
        >
          {/* Mobile top bar */}
          <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-10">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="p-2 text-gray-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-colors"
            >
              <Menu size={20} />
            </button>
            <span className="text-sm font-semibold text-gray-800">
              {links.find((l) => isActive(l))?.label || 'CRM'}
            </span>
          </div>

          <Outlet />
        </main>
      </div>

      {/* ── Mobile Bottom Tab Bar ────────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-100 safe-area-inset-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="flex">
          {bottomLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link);
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 px-1 transition-all ${
                  active ? 'text-primary-600' : 'text-gray-400'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-primary-50' : ''}`}>
                  <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                </div>
                <span className="text-[10px] font-medium mt-0.5 leading-tight text-center">
                  {link.shortLabel}
                </span>
              </NavLink>
            );
          })}
          {/* "More" tab to open the full nav drawer when there are >4 links */}
          {links.length > 4 && (
            <button
              onClick={() => setMobileNavOpen(true)}
              className="flex-1 flex flex-col items-center justify-center py-2.5 px-1 text-gray-400"
            >
              <div className="p-1.5 rounded-xl">
                <Menu size={20} strokeWidth={1.8} />
              </div>
              <span className="text-[10px] font-medium mt-0.5">More</span>
            </button>
          )}
        </div>
      </nav>
    </div>
  );
};

export default CrmLayout;
