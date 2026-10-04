import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const ICON_CLASS = 'h-4 w-4';

function ActionIcon({ name }) {
  const props = {
    viewBox: '0 0 24 24',
    className: ICON_CLASS,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  if (name === 'view') {
    return (
      <svg {...props}>
        <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    );
  }

  if (name === 'edit') {
    return (
      <svg {...props}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5z" />
      </svg>
    );
  }

  if (name === 'delete') {
    return (
      <svg {...props}>
        <path d="M4 7h16" />
        <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        <path d="M7 7l1 13h8l1-13" />
      </svg>
    );
  }

  if (name === 'deactivate') {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="8" />
        <path d="M7.5 16.5 16.5 7.5" />
      </svg>
    );
  }

  return null;
}

export default function Dropdown({ label = 'Actions', items, inline = false }) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  useLayoutEffect(() => {
    if (!open || inline) return undefined;

    function place() {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = 160;
      const height = 8 + items.length * 40;
      const openUp = window.innerHeight - rect.bottom < height && rect.top > height;
      setMenuStyle({
        position: 'fixed',
        top: openUp ? rect.top - height - 8 : rect.bottom + 8,
        left: Math.min(Math.max(8, rect.right - width), window.innerWidth - width - 8),
        width,
        zIndex: 40,
      });
    }

    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, inline, items.length]);

  useEffect(() => {
    if (!open) return undefined;
    function handleClick(event) {
      if (buttonRef.current?.contains(event.target) || menuRef.current?.contains(event.target)) return;
      setOpen(false);
    }
    function handleKey(event) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  if (inline) {
    return (
      <div className="flex flex-wrap justify-end gap-1.5">
        {items.map((item) => {
          const icon = <ActionIcon name={item.icon || item.label.toLowerCase()} />;
          return (
            <button
              key={item.label}
              type="button"
              aria-label={item.label}
              title={item.label}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 ${
                item.danger ? 'text-danger hover:border-danger' : 'text-muted hover:border-primary hover:text-primary'
              }`}
              onClick={item.onClick}
            >
              {icon || item.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative inline-block" ref={buttonRef}>
      <button
        type="button"
        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-muted hover:text-secondary"
        onClick={() => setOpen((value) => !value)}
      >
        {label}
      </button>
      {open && menuStyle
        ? createPortal(
            <div ref={menuRef} style={menuStyle} className="rounded-xl border border-white/10 bg-surface p-1 shadow-card">
              {items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className={`block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5 ${item.danger ? 'text-danger' : 'text-secondary'}`}
                  onClick={() => {
                    setOpen(false);
                    item.onClick();
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
