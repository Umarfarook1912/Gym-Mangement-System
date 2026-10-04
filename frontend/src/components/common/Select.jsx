export default function Select({ id, name, value, onChange, options, placeholder = 'Select', disabled }) {
  return (
    <select id={id || name} name={name} value={value ?? ''} onChange={onChange} disabled={disabled} className="field">
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
