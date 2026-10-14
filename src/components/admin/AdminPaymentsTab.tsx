import React from 'react';
import type { PaymentRecord } from '../../types/restaurant';

interface AdminPaymentsTabProps {
  payments: PaymentRecord[];
}

export const AdminPaymentsTab: React.FC<AdminPaymentsTabProps> = ({ payments }) => {
  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-xs text-[#B8AFC9]">
        ℹ️ Payment processing is simulated for portfolio demonstration. No live card charges occur.
      </div>
      <div className="nocturne-surface rounded-2xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-[#7E7394] border-b border-white/10">
            <tr>
              <th className="p-4">Transaction Ref</th>
              <th className="p-4">Order #</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Method</th>
              <th className="p-4 text-right">Amount</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono-tabular">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-white/5">
                <td className="p-4 text-[#8B5CF6]">{p.transactionRef}</td>
                <td className="p-4 text-[#F59E0B]">#{p.orderNumber}</td>
                <td className="p-4 font-sans text-[#F5F2FA]">{p.customerName}</td>
                <td className="p-4 font-sans text-[#B8AFC9]">{p.method}</td>
                <td className="p-4 text-right text-[#10B981]">${p.amount.toFixed(2)}</td>
                <td className="p-4">{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
