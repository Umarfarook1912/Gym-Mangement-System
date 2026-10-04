import { ACCOUNT_STATUS, GENDER, PLAN_STATUS } from '../../constants';
import { addMonthsToDateKey, formatDate, toDateKey } from '../../utils/date';
import { statusLabel } from '../../utils/format';
import Button from '../common/Button';
import DatePicker from '../common/DatePicker';
import FormField from '../common/FormField';
import Input from '../common/Input';
import Select from '../common/Select';

export const emptyMember = {
  fullName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  address: '',
  joinDate: '',
  membershipPlan: '',
  membershipStartDate: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  height: '',
  weight: '',
  status: ACCOUNT_STATUS.ACTIVE,
};

export function toMemberFormValues(member) {
  if (!member) return emptyMember;
  return {
    fullName: member.fullName || '',
    email: member.email || '',
    phone: member.phone || '',
    dateOfBirth: toDateKey(member.dateOfBirth),
    gender: member.gender || '',
    address: member.address || '',
    joinDate: member.joinDate || '',
    membershipPlan: member.membershipPlan?._id || member.membershipPlan || '',
    membershipStartDate: member.membershipStartDate || '',
    emergencyContactName: member.emergencyContactName || '',
    emergencyContactPhone: member.emergencyContactPhone || '',
    height: member.height ?? '',
    weight: member.weight ?? '',
    status: member.status || emptyMember.status,
  };
}

export default function MemberForm({ values, errors, submitting, plans, onChange, onSubmit, onCancel, formError, isEdit = false }) {
  const planOptions = (plans || [])
    .filter((plan) => plan.status === PLAN_STATUS.ACTIVE || (plan._id || plan.id) === values.membershipPlan)
    .map((plan) => ({
      value: plan._id || plan.id,
      label: `${plan.name} · ${plan.durationMonths} mo${plan.status === PLAN_STATUS.ACTIVE ? '' : ' · inactive'}`,
    }));
  const selectedPlan = (plans || []).find((plan) => (plan._id || plan.id) === values.membershipPlan);
  const membershipEnd = values.membershipStartDate && selectedPlan
    ? addMonthsToDateKey(values.membershipStartDate, selectedPlan.durationMonths)
    : '';

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <FormField label="Full name" error={errors.fullName}>
        <Input name="fullName" value={values.fullName} onChange={onChange} />
      </FormField>
      <FormField label="Email" error={errors.email}>
        <Input name="email" type="email" value={values.email} onChange={onChange} />
      </FormField>
      <FormField label="Phone" error={errors.phone}>
        <Input name="phone" value={values.phone} onChange={onChange} />
      </FormField>
      <FormField label="Date of birth" error={errors.dateOfBirth}>
        <DatePicker name="dateOfBirth" value={values.dateOfBirth} onChange={onChange} />
      </FormField>
      <FormField label="Gender" error={errors.gender}>
        <Select name="gender" value={values.gender} onChange={onChange} options={Object.values(GENDER).map((value) => ({ value, label: statusLabel(value) }))} />
      </FormField>
      <FormField label="Status" error={errors.status}>
        <Select name="status" value={values.status} onChange={onChange} placeholder="" options={Object.values(ACCOUNT_STATUS).map((value) => ({ value, label: statusLabel(value) }))} />
      </FormField>
      <FormField label="Address" error={errors.address}>
        <Input name="address" value={values.address} onChange={onChange} />
      </FormField>
      <FormField label="Join date" error={errors.joinDate}>
        <DatePicker name="joinDate" value={values.joinDate} onChange={onChange} />
      </FormField>
      <FormField label="Membership plan" error={errors.membershipPlan}>
        <Select name="membershipPlan" value={values.membershipPlan} onChange={onChange} options={planOptions} />
      </FormField>
      <FormField label="Membership start" error={errors.membershipStartDate}>
        <DatePicker name="membershipStartDate" value={values.membershipStartDate} onChange={onChange} />
      </FormField>
      <p className="text-sm text-muted sm:col-span-2">
        Membership ends {membershipEnd ? formatDate(membershipEnd) : 'when a plan and start date are selected'}.{' '}
        {isEdit
          ? 'Changing the plan or start date corrects this paid period. Use Mark as paid to add the next one.'
          : 'Saving records this first period as paid. Later periods are added with Mark as paid, and each one can use a different plan.'}
      </p>
      <FormField label="Emergency contact" error={errors.emergencyContactName}>
        <Input name="emergencyContactName" value={values.emergencyContactName} onChange={onChange} />
      </FormField>
      <FormField label="Emergency phone" error={errors.emergencyContactPhone}>
        <Input name="emergencyContactPhone" value={values.emergencyContactPhone} onChange={onChange} />
      </FormField>
      <FormField label="Height (cm)" error={errors.height}>
        <Input name="height" type="number" value={values.height} onChange={onChange} />
      </FormField>
      <FormField label="Weight (kg)" error={errors.weight}>
        <Input name="weight" type="number" value={values.weight} onChange={onChange} />
      </FormField>
      {formError ? <p className="text-sm text-danger sm:col-span-2">{formError}</p> : null}
      <div className="flex justify-end gap-2 sm:col-span-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          Save member
        </Button>
      </div>
    </form>
  );
}
