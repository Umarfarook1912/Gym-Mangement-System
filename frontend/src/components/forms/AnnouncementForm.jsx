import { ANNOUNCEMENT_TYPES } from '../../constants';
import { statusLabel } from '../../utils/format';
import Button from '../common/Button';
import DatePicker from '../common/DatePicker';
import FormField from '../common/FormField';
import Input from '../common/Input';
import Select from '../common/Select';

export const emptyAnnouncement = {
  type: ANNOUNCEMENT_TYPES.IMPORTANT,
  title: '',
  body: '',
  openTime: '',
  closeTime: '',
  effectiveDate: '',
  startDate: '',
  endDate: '',
  sendEmail: false,
};

export function toAnnouncementFormValues(announcement) {
  if (!announcement) return emptyAnnouncement;
  return {
    type: announcement.type || emptyAnnouncement.type,
    title: announcement.title || '',
    body: announcement.body || '',
    openTime: announcement.openTime || '',
    closeTime: announcement.closeTime || '',
    effectiveDate: announcement.effectiveDate || '',
    startDate: announcement.startDate || '',
    endDate: announcement.endDate || '',
    sendEmail: Boolean(announcement.sendEmail),
  };
}

export default function AnnouncementForm({ values, errors, submitting, onChange, onSubmit, onCancel }) {
  const isTiming = values.type === ANNOUNCEMENT_TYPES.TIMING;
  const isMaintenance = values.type === ANNOUNCEMENT_TYPES.MAINTENANCE;

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
      {isTiming ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Opens" error={errors.openTime}>
              <Input name="openTime" type="time" value={values.openTime} onChange={onChange} />
            </FormField>
            <FormField label="Closes" error={errors.closeTime}>
              <Input name="closeTime" type="time" value={values.closeTime} onChange={onChange} />
            </FormField>
          </div>
          <FormField label="Effective from" error={errors.effectiveDate}>
            <DatePicker name="effectiveDate" value={values.effectiveDate} onChange={onChange} />
          </FormField>
          <FormField label="Note" error={errors.body}>
            <textarea name="body" value={values.body} onChange={onChange} rows={4} className="field" placeholder="Optional note for members" />
          </FormField>
        </>
      ) : null}
      {isMaintenance ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Starts" error={errors.startDate}>
              <DatePicker name="startDate" value={values.startDate} onChange={onChange} />
            </FormField>
            <FormField label="Ends" error={errors.endDate}>
              <DatePicker name="endDate" value={values.endDate} onChange={onChange} />
            </FormField>
          </div>
          <FormField label="Details" error={errors.body}>
            <textarea name="body" value={values.body} onChange={onChange} rows={4} className="field" />
          </FormField>
        </>
      ) : null}
      {!isTiming && !isMaintenance ? (
        <>
          <FormField label="Title" error={errors.title}>
            <Input name="title" value={values.title} onChange={onChange} />
          </FormField>
          <FormField label="Details" error={errors.body}>
            <textarea name="body" value={values.body} onChange={onChange} rows={5} className="field" />
          </FormField>
        </>
      ) : null}
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
