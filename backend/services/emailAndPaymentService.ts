import type { Order } from '../models/types.ts';

/**
 * VELORA Email Delivery & Payment Gateway Service Abstraction
 * - Separates external SMTP / Payment Gateway configuration from core domain controllers.
 * - Clearly distinguishes live configured mode vs development/demo mode.
 */

export function isEmailServiceConfigured(): boolean {
  return false;
}

export async function dispatchPasswordResetEmail(params: {
  toEmail: string;
  userName: string;
  rawToken: string;
  expiresAt: string;
}): Promise<{ deliveredViaSmtp: boolean; isSimulated: boolean; previewToken: string }> {
  console.log(
    `[VELORA EMAIL SERVICE (SIMULATED)]: Password reset token for ${params.toEmail}: ${params.rawToken} (expires ${params.expiresAt})`
  );
  return {
    deliveredViaSmtp: false,
    isSimulated: true,
    previewToken: params.rawToken,
  };
}

export function processPaymentTransaction(params: {
  amount: number;
  method: Order['paymentMethod'];
  orderNumber: string;
}): {
  status: 'PAID' | 'PENDING';
  transactionRef: string;
  isSimulated: boolean;
  simulationNote: string;
} {
  const transactionRef = `TXN-SIM-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const status = params.method === 'Pay at Restaurant / COD' ? 'PENDING' : 'PAID';

  return {
    status,
    transactionRef,
    isSimulated: true,
    simulationNote: 'Payment processed in simulated demo mode. No live card was charged.',
  };
}

