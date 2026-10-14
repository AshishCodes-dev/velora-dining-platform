import React, { useState } from 'react';
import type { StaffMember } from '../../types/restaurant';

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
        <h2 className="font-serif-display text-xl font-semibold text-[#F5F2FA]">
          Add Culinary / Hospitality Staff
        </h2>
        <input
          type="text"
          required
          value={staffName}
          onChange={(e) => setStaffName(e.target.value)}
          placeholder="Full Name"
          className="w-full px-3.5 py-2 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA]"
        />
        <input
          type="text"
          required
          value={staffRole}
          onChange={(e) => setStaffRole(e.target.value)}
          placeholder="Role Title (e.g. Sous Chef)"
          className="w-full px-3.5 py-2 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA]"
        />
        <select
          value={staffDept}
          onChange={(e) => setStaffDept(e.target.value as StaffMember['department'])}
          className="w-full px-3.5 py-2 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA]"
        >
          <option value="Culinary">Culinary</option>
          <option value="Sommelier & Bar">Sommelier &amp; Bar</option>
          <option value="Hospitality">Hospitality</option>
          <option value="Operations">Operations</option>
        </select>
        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-[#8B5CF6] text-white text-xs font-semibold"
        >
          Add Staff Member
        </button>
      </form>

      <div className="lg:col-span-8 space-y-3">
        {staffList.map((s) => (
          <div
            key={s.id}
            className="nocturne-surface rounded-xl p-5 flex items-center justify-between gap-4"
          >
            <div>
              <p className="text-sm font-semibold text-[#F5F2FA]">
                {s.name} · <span className="text-[#8B5CF6]">{s.roleTitle}</span>
              </p>
              <p className="text-xs text-[#B8AFC9] mt-0.5">
                {s.department} · {s.shift}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleStatus(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  s.status === 'ON_DUTY'
                    ? 'bg-[#10B981]/20 text-[#10B981]'
                    : 'bg-white/5 text-[#7E7394]'
                }`}
              >
                {s.status === 'ON_DUTY' ? 'On Duty' : 'Off Duty'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
