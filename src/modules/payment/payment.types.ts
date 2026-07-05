export interface PaymentInitResult {
  kind: 'redirect' | 'pending' | 'manual';
  redirectUrl?: string | null;
  message?: string | null;
  providerReference?: string | null;
}
