import { Link } from 'react-router-dom';

export default function Breadcrumb({ items }) {
  return (
    <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted">
      {items.map((item, index) => (
        <span key={item.label} className="flex items-center gap-2">
          {index > 0 ? <span>/</span> : null}
          {item.to ? (
            <Link to={item.to} className="hover:text-primary">
              {item.label}
            </Link>
          ) : (
            <span className="text-secondary">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
