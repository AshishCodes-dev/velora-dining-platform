import React from 'react';
import type { PaymentRecord } from '../../types/restaurant';
import { Badge } from '../ui/Badge';

interface AdminPaymentsTabProps {
  payments: PaymentRecord[];
}

export const AdminPaymentsTab: React.FC<AdminPaymentsTabProps> = ({ payments }) => {
  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl bg-yellow/10 border border-yellow/20 text-xs text-text-soft">
        ℹ️ Payment processing is simulated for portfolio demonstration. No live card charges occur.
      </div>
      <div className="nocturne-surface rounded-2xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-text-muted border-b border-border">
            <tr>
              <th className="p-4">Transaction Ref</th>
              <th className="p-4">Order #</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Method</th>
              <th className="p-4 text-right">Amount</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-mono-tabular">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 text-yellow">{p.transactionRef}</td>
                <td className="p-4 text-yellow">#{p.orderNumber}</td>
                <td className="p-4 font-sans text-text">{p.customerName}</td>
                <td className="p-4 font-sans text-text-soft">{p.method}</td>
                <td className="p-4 text-right text-green-light">${p.amount.toFixed(2)}</td>
                <td className="p-4 font-sans">
                  <Badge
                    variant={p.status === 'PAID' ? 'success' : 'yellow'}
                    dot
                  >
                    {p.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
