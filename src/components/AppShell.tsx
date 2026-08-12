import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useDashboard } from '../context/DashboardContext';

const nav = [
  { to: '/', label: 'Overview', index: '01', end: true },
  { to: '/clients', label: 'Clients', index: '02' },
  { to: '/projects', label: 'Projects', index: '03' },
];

function titleForPath(pathname: string): string {
  if (pathname.startsWith('/clients/new')) return 'New client';
  if (pathname.startsWith('/clients/') && pathname !== '/clients') {
    return 'Client detail';
  }
  if (pathname.startsWith('/clients')) return 'Clients';
  if (/^\/projects\/[^/]+\/edit/.test(pathname)) return 'Edit project';
  if (pathname.startsWith('/projects')) return 'Projects';
  return 'Overview';
}

export function AppShell() {
  const location = useLocation();
  const { resetToSeed, clients } = useDashboard();
  const title = titleForPath(location.pathname);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <img
            className="brand-logo"
            src="/neuroweb-logo.png"
            alt="Neuroweb"
            width={48}
            height={48}
          />
          <div className="brand-text">
            <div className="brand-name">
              Neuro<span>web</span>
            </div>
            <div className="brand-sub">Client ops · local</div>
          </div>
        </div>

        <nav className="nav">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `nav-link${isActive ? ' active' : ''}`
              }
            >
              <span className="nav-index">{item.index}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="mono-label">{clients.length} clients stored</div>
          <button
            type="button"
            className="btn btn-quiet"
            onClick={() => {
              if (
                window.confirm(
                  'Clear all clients, projects, and activity from local storage?',
                )
              ) {
                resetToSeed();
              }
            }}
          >
            Clear data
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar-meta">
            <div className="mono-label">Neuroweb dashboard</div>
            <div className="topbar-title">{title}</div>
          </div>
          <div className="topbar-actions">
            <span className="badge badge-online">
              <span className="dot" />
              Local store
            </span>
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
