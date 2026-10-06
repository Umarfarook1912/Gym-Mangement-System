import { useState } from 'react';

function EyeIcon({ off }) {
  if (off) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.88 5.09A10.4 10.4 0 0 1 12 4.5c4.76 0 8.77 3.16 10.07 7.5a11.7 11.7 0 0 1-2.17 3.59" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.11 6.11A11.8 11.8 0 0 0 1.93 12C3.23 16.34 7.24 19.5 12 19.5c1.18 0 2.31-.18 3.36-.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.04 12.32a1 1 0 0 1 0-.64C3.42 7.51 7.36 4.5 12 4.5s8.57 3.01 9.96 7.18a1 1 0 0 1 0 .64C20.58 16.49 16.64 19.5 12 19.5s-8.57-3.01-9.96-7.18z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function Input({ id, name, type = 'text', value, onChange, placeholder, disabled }) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';

  const field = (
    <input
      id={id || name}
      name={name}
      type={isPassword && visible ? 'text' : type}
      value={value ?? ''}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={isPassword ? 'field pr-11' : 'field'}
    />
  );

  if (!isPassword) return field;

  return (
    <span className="relative block">
      {field}
      <button
        type="button"
        disabled={disabled}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setVisible((current) => !current);
        }}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted hover:text-primary disabled:pointer-events-none"
      >
        <EyeIcon off={visible} />
      </button>
    </span>
  );
}
