export interface PaymentInitResult {
  kind: 'redirect' | 'pending' | 'manual';
  redirectUrl?: string | null;
  iframeToken?: string | null;
  message?: string | null;
  providerReference?: string | null;
}
