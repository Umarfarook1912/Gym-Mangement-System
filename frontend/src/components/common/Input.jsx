export default function Input({ id, name, type = 'text', value, onChange, placeholder, disabled }) {
  return (
    <input
      id={id || name}
      name={name}
      type={type}
      value={value ?? ''}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className="field"
    />
  );
}
