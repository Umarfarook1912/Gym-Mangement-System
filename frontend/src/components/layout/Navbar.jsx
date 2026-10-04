import { Link } from 'react-router-dom';
import { ROUTES, USER_ROLES } from '../../constants';
import Button from '../common/Button';
import ThemeToggle from '../common/ThemeToggle';

export default function Navbar({ user, gymName, hoursLabel, onMenu, onLogout }) {
  const profilePath = user?.role === USER_ROLES.ADMIN ? ROUTES.ADMIN_PROFILE : ROUTES.MEMBER_PROFILE;

  return (
    <header className="no-print flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button type="button" className="rounded-lg border border-white/10 px-3 py-2 text-sm lg:hidden" onClick={onMenu}>
          Menu
        </button>
        <div>
          <p className="text-sm text-muted">{gymName}</p>
          {hoursLabel ? <p className="text-xs text-secondary">{hoursLabel}</p> : null}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Link to={profilePath} className="text-sm text-secondary hover:text-primary">
          {user?.fullName}
        </Link>
        <Button variant="ghost" onClick={onLogout}>
          Logout
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
