import React, { useState } from 'react';
import type { StaffMember } from '../../types/restaurant';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface AdminStaffTabProps {
  staffList: StaffMember[];
  onAddStaff: (data: {
    name: string;
    roleTitle: string;
    department: StaffMember['department'];
    email: string;
    phone: string;
  }) => Promise<void>;
  onToggleStatus: (id: string) => Promise<void>;
}

export const AdminStaffTab: React.FC<AdminStaffTabProps> = ({
  staffList,
  onAddStaff,
  onToggleStatus,
}) => {
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState('Sous Chef');
  const [staffDept, setStaffDept] = useState<StaffMember['department']>('Culinary');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim()) return;
    await onAddStaff({
      name: staffName,
      roleTitle: staffRole,
      department: staffDept,
      email: staffEmail,
      phone: staffPhone,
    });
    setStaffName('');
    setStaffEmail('');
    setStaffPhone('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-4 nocturne-surface rounded-2xl p-6 space-y-4 h-fit"
      >
        <h2 className="font-serif-display text-xl font-semibold text-text">
          Add Culinary / Hospitality Staff
        </h2>
        <input
          type="text"
          required
          value={staffName}
          onChange={(e) => setStaffName(e.target.value)}
          placeholder="Full Name"
          className="w-full px-3.5 py-2 rounded-xl bg-canvas border border-border text-xs text-text placeholder-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-colors"
        />
        <input
          type="text"
          required
          value={staffRole}
          onChange={(e) => setStaffRole(e.target.value)}
          placeholder="Role Title (e.g. Sous Chef)"
          className="w-full px-3.5 py-2 rounded-xl bg-canvas border border-border text-xs text-text placeholder-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-colors"
        />
        <select
          value={staffDept}
          onChange={(e) => setStaffDept(e.target.value as StaffMember['department'])}
          className="w-full px-3.5 py-2 rounded-xl bg-canvas border border-border text-xs text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-colors"
        >
          <option value="Culinary">Culinary</option>
          <option value="Sommelier & Bar">Sommelier &amp; Bar</option>
          <option value="Hospitality">Hospitality</option>
          <option value="Operations">Operations</option>
        </select>
        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
        >
          Add Staff Member
        </Button>
      </form>

      <div className="lg:col-span-8 space-y-3">
        {staffList.map((s) => (
          <div
            key={s.id}
            className="nocturne-surface rounded-xl p-5 flex items-center justify-between gap-4 transition-colors hover:border-border-accent"
          >
            <div>
              <p className="text-sm font-semibold text-text">
                {s.name} · <span className="text-yellow">{s.roleTitle}</span>
              </p>
              <p className="text-xs text-text-soft mt-0.5">
                {s.department} · {s.shift}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleStatus(s.id)}
                aria-label={`Toggle status for ${s.name}`}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow rounded-full transition-transform active:scale-95"
              >
                <Badge
                  variant={s.status === 'ON_DUTY' ? 'success' : 'neutral'}
                  dot
                  className="cursor-pointer"
                >
                  {s.status === 'ON_DUTY' ? 'On Duty' : 'Off Duty'}
                </Badge>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
