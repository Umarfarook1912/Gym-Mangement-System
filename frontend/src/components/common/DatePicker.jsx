export default function DatePicker({ name, value, onChange }) {
  return <input type="date" name={name} value={value || ''} onChange={onChange} className="field" />;
}
