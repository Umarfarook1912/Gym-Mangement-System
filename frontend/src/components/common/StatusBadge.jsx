import { MEMBERSHIP_STATUS, ATTENDANCE_STATUS, ACCOUNT_STATUS, PLAN_STATUS } from '../../constants';
import { statusLabel } from '../../utils/format';
import Badge from './Badge';

const SUCCESS = [MEMBERSHIP_STATUS.ACTIVE, ACCOUNT_STATUS.ACTIVE, PLAN_STATUS.ACTIVE, ATTENDANCE_STATUS.PRESENT, ATTENDANCE_STATUS.CHECKED_OUT];
const DANGER = [MEMBERSHIP_STATUS.EXPIRED, ATTENDANCE_STATUS.ABSENT];

export default function StatusBadge({ status }) {
  let tone = 'gold';
  if (SUCCESS.includes(status)) tone = 'success';
  if (DANGER.includes(status)) tone = 'danger';
  return <Badge tone={tone}>{statusLabel(status)}</Badge>;
}
