import { ANNOUNCEMENT_TYPES } from '../../constants';
import { statusLabel } from '../../utils/format';
import Button from '../common/Button';
import FormField from '../common/FormField';
import Input from '../common/Input';
import Select from '../common/Select';

export const emptyAnnouncement = {
  type: ANNOUNCEMENT_TYPES.IMPORTANT,
  title: '',
  body: '',
  sendEmail: false,
};

export default function AnnouncementForm({ values, errors, submitting, onChange, onSubmit, onCancel }) {
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <FormField label="Type" error={errors.type}>
        <Select
          name="type"
          value={values.type}
          onChange={onChange}
          placeholder=""
          options={Object.values(ANNOUNCEMENT_TYPES).map((value) => ({ value, label: statusLabel(value) }))}
        />
      </FormField>
      <FormField label="Title" error={errors.title}>
        <Input name="title" value={values.title} onChange={onChange} />
      </FormField>
      <FormField label="Details" error={errors.body}>
        <textarea name="body" value={values.body} onChange={onChange} rows={5} className="field" />
      </FormField>
      <label className="flex items-center gap-2 text-sm text-muted">
        <input type="checkbox" name="sendEmail" checked={Boolean(values.sendEmail)} onChange={onChange} />
        Email this announcement to active members
      </label>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          Save announcement
        </Button>
      </div>
    </form>
  );
}
