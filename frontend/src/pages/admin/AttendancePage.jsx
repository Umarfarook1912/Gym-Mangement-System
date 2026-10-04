import { useState } from 'react';
import Button from '../../components/common/Button';
import DatePicker from '../../components/common/DatePicker';
import Dropdown from '../../components/common/Dropdown';
import FormField from '../../components/common/FormField';
import MonthCalendar from '../../components/common/MonthCalendar';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';
import StatusBadge from '../../components/common/StatusBadge';
import Card from '../../components/cards/Card';
import StatCard from '../../components/cards/StatCard';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import Modal from '../../components/modals/Modal';
import DataTable from '../../components/tables/DataTable';
import { MEMBERSHIP_STATUS } from '../../constants';
import { useToast } from '../../context/ToastContext';
import { useDebounce } from '../../hooks/useDebounce';
import { useFetch } from '../../hooks/useFetch';
import { useForm } from '../../hooks/useForm';
import { useModal } from '../../hooks/useModal';
import * as attendanceService from '../../services/attendanceService';
import { listMembers } from '../../services/memberService';
import { formatDate, monthKey, todayKey } from '../../utils/date';
import { applyApiErrors } from '../../utils/format';
import { validateAttendanceTimes, validatePastAttendance } from '../../validations';

export default function AttendancePage() {
  const toast = useToast();
  const [date, setDate] = useState(todayKey());
  const [month, setMonth] = useState(monthKey());
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [working, setWorking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const debouncedSearch = useDebounce(search);
  const editor = useModal();
  const confirm = useModal();

  const today = useFetch(() => attendanceService.getByDate(date), [date]);
  const summary = useFetch(() => attendanceService.getToday(), []);
  const calendar = useFetch(() => attendanceService.getCalendar(month), [month]);
  const members = useFetch(
    () => listMembers({ search: debouncedSearch, status: MEMBERSHIP_STATUS.ACTIVE, limit: 8, page: 1 }),
    [debouncedSearch]
  );

  function refreshAttendance() {
    today.reload();
    summary.reload();
    calendar.reload();
  }

  const timeForm = useForm({
    initialValues: { checkInTime: '', checkOutTime: '' },
    validate: validateAttendanceTimes,
    onSubmit: async (values, { setErrors }) => {
      try {
        await attendanceService.updateAttendance(editor.payload.id, {
          checkInTime: values.checkInTime,
          checkOutTime: values.checkOutTime,
        });
        toast.success('Attendance updated');
        editor.closeModal();
        refreshAttendance();
      } catch (requestError) {
        applyApiErrors(requestError, setErrors);
        toast.error(requestError.message);
      }
    },
  });

  const pastDay = date < todayKey();
  const futureDay = date > todayKey();

  const pastForm = useForm({
    initialValues: { checkInTime: '', checkOutTime: '' },
    validate: validatePastAttendance,
    onSubmit: async (values, { setErrors }) => {
      if (!selectedMember) {
        toast.error('Select a member first');
        return;
      }
      try {
        await attendanceService.recordManual({
          memberId: selectedMember._id,
          date,
          checkInTime: values.checkInTime,
          checkOutTime: values.checkOutTime,
        });
        toast.success('Attendance recorded');
        pastForm.reset();
        refreshAttendance();
      } catch (requestError) {
        applyApiErrors(requestError, setErrors);
        toast.error(requestError.message);
      }
    },
  });

  function openEdit(row) {
    timeForm.reset({ checkInTime: row.checkInTime || '', checkOutTime: row.checkOutTime || '' });
    editor.openModal(row);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await attendanceService.deleteAttendance(confirm.payload.id);
      toast.success('Attendance deleted');
      confirm.closeModal();
      refreshAttendance();
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setDeleting(false);
    }
  }

  function changeMonth(nextMonth) {
    const currentDay = Number(date.slice(8)) || 1;
    const [year, monthIndex] = nextMonth.split('-').map(Number);
    const lastDay = new Date(Date.UTC(year, monthIndex, 0)).getUTCDate();
    const day = String(Math.min(currentDay, lastDay)).padStart(2, '0');
    setMonth(nextMonth);
    setDate(`${nextMonth}-${day}`);
  }

  function attendanceMessage() {
    const label = formatDate(date);
    const currentDay = todayKey();
    if (today.loading) return `Loading attendance for ${label}.`;
    const count = today.data?.length || 0;
    if (date > currentDay) return `${label} is still ahead. Check-ins for this day will appear after members arrive.`;
    if (date < currentDay) return count ? `${count} check-in${count === 1 ? '' : 's'} on ${label}.` : `No members checked in on ${label}.`;
    return count ? `${count} check-in${count === 1 ? '' : 's'} today, ${label}.` : `No members have checked in today, ${label}.`;
  }

  async function run(action) {
    if (!selectedMember) {
      toast.error('Select a member first');
      return;
    }
    if (date !== todayKey()) {
      toast.error(`Check-in and check-out are for today, ${formatDate(todayKey())}. You are viewing ${formatDate(date)}.`);
      return;
    }
    setWorking(true);
    try {
      await action(selectedMember._id);
      toast.success('Attendance updated');
      refreshAttendance();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setWorking(false);
    }
  }

  return (
    <div>
      <PageHeader title="Attendance" subtitle="One check-in per member each day. Checkout follows the gym setting." />
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <StatCard label="Present today" value={summary.data?.present ?? 0} />
        <StatCard label="Absent today" value={summary.data?.absent ?? 0} />
        <StatCard label="Checkout required" value={summary.data?.checkoutRequired ? 'Yes' : 'No'} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card title="Check in / out">
          <SearchInput value={search} onChange={setSearch} placeholder="Find a member" />
          <ul className="mt-3 max-h-56 space-y-1 overflow-auto">
            {(members.data?.items || []).map((member) => (
              <li key={member._id}>
                <button
                  type="button"
                  onClick={() => setSelectedMember(member)}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm ${
                    selectedMember?._id === member._id ? 'bg-primary text-on-primary' : 'hover:bg-white/5'
                  }`}
                >
                  <span className="block font-medium">{member.fullName}</span>
                  <span className={selectedMember?._id === member._id ? 'text-on-primary/80' : 'text-muted'}>{member.memberId}</span>
                </button>
              </li>
            ))}
          </ul>
          {pastDay ? (
            <form onSubmit={pastForm.handleSubmit} className="mt-4 grid gap-3">
              <p className="text-sm text-muted">Enter the start and end time for {formatDate(date)}.</p>
              <FormField label="Start" error={pastForm.errors.checkInTime}>
                <input type="time" name="checkInTime" value={pastForm.values.checkInTime} onChange={pastForm.handleChange} className="field" />
              </FormField>
              <FormField label="End" error={pastForm.errors.checkOutTime}>
                <input type="time" name="checkOutTime" value={pastForm.values.checkOutTime} onChange={pastForm.handleChange} className="field" />
              </FormField>
              <Button type="submit" loading={pastForm.submitting}>
                Submit
              </Button>
            </form>
          ) : null}
          {futureDay ? <p className="mt-4 text-sm text-muted">This day has not started. Check-in is available today.</p> : null}
          {!pastDay && !futureDay ? (
            <div className="mt-4 flex gap-2">
              <Button loading={working} onClick={() => run(attendanceService.checkIn)}>
                Check in
              </Button>
              <Button variant="ghost" loading={working} onClick={() => run(attendanceService.checkOut)}>
                Check out
              </Button>
            </div>
          ) : null}
        </Card>
        <Card title="Calendar">
          <MonthCalendar
            month={month}
            days={calendar.data?.days || {}}
            selected={date}
            onSelect={(key) => {
              setDate(key);
              setMonth(key.slice(0, 7));
            }}
            onMonthChange={changeMonth}
          />
        </Card>
      </div>
      <div className="mt-4 panel p-4">
        <div className="mb-4 max-w-xs">
          <DatePicker
            name="date"
            value={date}
            onChange={(event) => {
              const nextDate = event.target.value;
              setDate(nextDate);
              if (nextDate) setMonth(nextDate.slice(0, 7));
            }}
          />
        </div>
        <p className="mb-4 text-sm text-secondary">{attendanceMessage()}</p>
        <DataTable
          loading={today.loading}
          rows={today.data || []}
          rowKey="id"
          emptyTitle={date > todayKey() ? 'This day has not started' : 'No check-ins'}
          emptyDescription={
            futureDay
              ? 'Return to today to check a member in.'
              : pastDay
                ? 'Select a member, then enter the start and end time.'
                : 'Choose another date, or check a member in today.'
          }
          columns={[
            { key: 'memberId', label: 'Member ID', render: (row) => row.member?.memberId },
            { key: 'name', label: 'Name', render: (row) => row.member?.fullName },
            { key: 'checkInLabel', label: 'Check in' },
            { key: 'checkOutLabel', label: 'Check out', render: (row) => row.checkOutLabel || '—' },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
            {
              key: 'actions',
              label: 'Actions',
              render: (row) => (
                <Dropdown
                  items={[
                    { label: 'Edit times', onClick: () => openEdit(row) },
                    { label: 'Delete', onClick: () => confirm.openModal(row) },
                  ]}
                />
              ),
            },
          ]}
        />
      </div>
      <Modal
        open={editor.open}
        title="Edit attendance"
        onClose={editor.closeModal}
      >
        <p className="mb-4 text-sm text-muted">
          {editor.payload?.member?.fullName} · {editor.payload?.dateLabel}
        </p>
        <form onSubmit={timeForm.handleSubmit} className="grid gap-4">
          <FormField label="Check in" error={timeForm.errors.checkInTime}>
            <input type="time" name="checkInTime" value={timeForm.values.checkInTime} onChange={timeForm.handleChange} className="field" />
          </FormField>
          <FormField label="Check out" error={timeForm.errors.checkOutTime}>
            <input type="time" name="checkOutTime" value={timeForm.values.checkOutTime} onChange={timeForm.handleChange} className="field" />
          </FormField>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={editor.closeModal}>
              Cancel
            </Button>
            <Button type="submit" loading={timeForm.submitting}>
              Save
            </Button>
          </div>
        </form>
      </Modal>
      <ConfirmationModal
        open={confirm.open}
        title="Delete attendance"
        message={`Delete the check-in for ${confirm.payload?.member?.fullName || 'this member'}? They can check in again on that day.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={confirm.closeModal}
      />
    </div>
  );
}
