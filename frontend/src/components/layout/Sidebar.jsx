import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '../../constants';

export default function Sidebar({ role, gymName, open, onNavigate }) {
  const items = NAV_ITEMS[role] || [];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 h-screen w-64 shrink-0 overflow-y-auto border-r border-white/10 bg-background p-5 transition-transform lg:static lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.22em] text-primary">Performance</p>
        <p className="mt-2 text-xl font-semibold">{gymName}</p>
      </div>
      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `rounded-xl px-3 py-2.5 text-sm ${isActive ? 'bg-primary text-on-primary' : 'text-muted hover:bg-white/5 hover:text-secondary'}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
