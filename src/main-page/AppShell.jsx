import { NavLink, useNavigate } from 'react-router-dom';
import { useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import TokenContext from '../accessContext/tokenContext';
import './shell.css';

const ICONS = {
  dashboard: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
  income: 'M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z',
  expense: 'M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z',
  logout: 'M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z',
};

const NAV = [
  { key: 'dashboard', label: 'Dashboard', to: '/dashboard' },
  { key: 'income', label: 'Income', to: '/incomepage' },
  { key: 'expense', label: 'Expense', to: '/expensepage' },
];

function RailIcon({ d }) {
  return (
    <span className="rail-icon">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d={d} />
      </svg>
    </span>
  );
}

/**
 * Shared app shell: hover-expanding icon rail on the left,
 * top bar with brand, pill nav and avatar menu.
 */
function AppShell({ children }) {
  const navigate = useNavigate();
  const { accesstoken } = useContext(TokenContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const email = localStorage.getItem('email') || '';
  const initials = email.slice(0, 2).toUpperCase() || 'ET';

  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const logout = async () => {
    try {
      await axios.get('https://login-backend-izl3.onrender.com/log/out', {
        withCredentials: true,
        headers: { Authorization: `<Bearer> ${accesstoken}` },
      });
    } catch (err) {
      /* fall through to local cleanup */
    }
    localStorage.removeItem('email');
    navigate('/');
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">E</span>
          <span className="brand-name">ExpenseTracker</span>
        </div>
        <nav className="topnav" aria-label="Primary">
          {NAV.map((item) => (
            <NavLink
              key={item.key}
              to={item.to}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="avatar-wrap" ref={menuRef}>
          <button
            className="avatar"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Account menu"
          >
            {initials}
          </button>
          {menuOpen && (
            <div className="avatar-menu">
              <div className="avatar-email">{email}</div>
              <button className="avatar-logout" onClick={logout}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d={ICONS.logout} />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="app-body">
        <aside className="rail" aria-label="Sidebar">
          <nav className="rail-nav">
            {NAV.map((item) => (
              <NavLink
                key={item.key}
                to={item.to}
                className={({ isActive }) =>
                  `rail-link${isActive ? ' rail-link-active' : ''}`
                }
              >
                <RailIcon d={ICONS[item.key]} />
                <span className="rail-label">{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="rail-foot">
            <button className="rail-link" onClick={logout}>
              <RailIcon d={ICONS.logout} />
              <span className="rail-label">Logout</span>
            </button>
          </div>
        </aside>
        <main className="page">{children}</main>
      </div>
    </div>
  );
}

export default AppShell;
