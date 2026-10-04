import { PLAN_STATUS } from '../../constants';
import { statusLabel } from '../../utils/format';
import Button from '../common/Button';
import FormField from '../common/FormField';
import Input from '../common/Input';
import Select from '../common/Select';

export const emptyPlan = {
  name: '',
  durationMonths: '1',
  price: '',
  status: PLAN_STATUS.ACTIVE,
};

export default function PlanForm({ values, errors, submitting, onChange, onSubmit, onCancel }) {
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <FormField label="Plan name" error={errors.name}>
        <Input name="name" value={values.name} onChange={onChange} />
      </FormField>
      <FormField label="Duration (months)" error={errors.durationMonths}>
        <Input name="durationMonths" type="number" value={values.durationMonths} onChange={onChange} />
      </FormField>
      <FormField label="Price (INR)" error={errors.price}>
        <Input name="price" type="number" value={values.price} onChange={onChange} />
      </FormField>
      <FormField label="Status" error={errors.status}>
        <Select
          name="status"
          value={values.status}
          onChange={onChange}
          placeholder=""
          options={Object.values(PLAN_STATUS).map((value) => ({ value, label: statusLabel(value) }))}
        />
      </FormField>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          Save plan
        </Button>
      </div>
    </form>
  );
}
