import { NavLink } from 'react-router-dom';
import './auth.css';

// Money-themed side-panel artwork (Pexels CDN, hotlinked like the rest of
// the app's external assets — keeps the repo free of large binaries).
const MONEY_ART_URL =
  'https://images.pexels.com/photos/10149293/pexels-photo-10149293.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940';

/**
 * Shared split-card layout for the auth pages (login / register / OTP).
 * Left: money-themed artwork panel. Right: form panel with tabbed
 * Sign In / Register selection at the top.
 *
 * `tab` is 'login' | 'register' | null. Null hides the tabs (used by OTP).
 */
function AuthLayout({ tab, heading, subheading, children }) {
  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-art" style={{ backgroundImage: `url(${MONEY_ART_URL})` }}>
          <div className="auth-art-top">
            <span className="auth-art-wordmark">Expense Tracker</span>
          </div>
          <div className="auth-art-caption">
            <p className="auth-art-title">Know where your money goes.</p>
            <p className="auth-art-sub">Track income and expenses in one calm place.</p>
          </div>
        </div>

        <div className="auth-panel">
          <div className="auth-topbar">
            {tab ? (
              <div className="auth-tabs" role="tablist" aria-label="Account">
                <NavLink
                  to="/"
                  role="tab"
                  aria-selected={tab === 'login'}
                  className={`auth-tab${tab === 'login' ? ' auth-tab-active' : ''}`}
                >
                  Sign In
                </NavLink>
                <NavLink
                  to="/register"
                  role="tab"
                  aria-selected={tab === 'register'}
                  className={`auth-tab${tab === 'register' ? ' auth-tab-active' : ''}`}
                >
                  Register
                </NavLink>
              </div>
            ) : (
              <span />
            )}
            <span className="auth-brand">EXPENSETRACKER</span>
          </div>

          <div className="auth-head">
            <h1 className="auth-heading">{heading}</h1>
            {subheading && <p className="auth-sub">{subheading}</p>}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
