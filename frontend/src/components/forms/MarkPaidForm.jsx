import { useState } from 'react';
import { PLAN_STATUS } from '../../constants';
import { addMonthsToDateKey, formatDate, nextPeriodStart, todayKey } from '../../utils/date';
import { formatCurrency } from '../../utils/format';
import Button from '../common/Button';
import FormField from '../common/FormField';
import Select from '../common/Select';

export default function MarkPaidForm({ member, payments, plans, submitting, onSubmit, onCancel }) {
  const [planId, setPlanId] = useState(member?.membershipPlan?._id || member?.membershipPlan || '');
  const [error, setError] = useState('');
  const latestEnd = (payments || []).reduce(
    (latest, payment) => (payment.endDate > latest ? payment.endDate : latest),
    member?.membershipEndDate || ''
  );
  const nextStart = nextPeriodStart(latestEnd);
  const today = todayKey();
  const activePlans = (plans || []).filter((plan) => plan.status === PLAN_STATUS.ACTIVE);
  const selectedPlan = activePlans.find((plan) => (plan._id || plan.id) === planId);
  const nextEnd = selectedPlan ? addMonthsToDateKey(nextStart, selectedPlan.durationMonths) : '';

  async function submit(event) {
    event.preventDefault();
    if (!planId) {
      setError('Select a plan');
      return;
    }
    setError('');
    try {
      await onSubmit(planId);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-muted">
        {latestEnd && latestEnd >= today
          ? `The last paid period ends ${formatDate(latestEnd)}. The next one starts ${formatDate(nextStart)} and can use a different plan.`
          : `The last paid period ended ${formatDate(latestEnd)}. This payment starts access on ${formatDate(nextStart)}.`}
      </p>
      <FormField label="Plan for this period" error={error}>
        <Select
          name="membershipPlan"
          value={planId}
          onChange={(event) => setPlanId(event.target.value)}
          options={activePlans.map((plan) => ({
            value: plan._id || plan.id,
            label: `${plan.name} · ${plan.durationMonths} mo · ${formatCurrency(plan.price)}`,
          }))}
        />
      </FormField>
      <p className="text-sm text-muted">
        {nextEnd
          ? `Access runs ${formatDate(nextStart)} to ${formatDate(nextEnd)}. Amount ${formatCurrency(selectedPlan.price)}.`
          : 'Choose a plan to see the new start and end dates.'}
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          Mark as paid
        </Button>
      </div>
    </form>
  );
}
