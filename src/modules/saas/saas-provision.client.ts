import { env } from '../../config/index.js';

export interface SaasProvisionPayload {
  externalOrderNo: string;
  externalOrderItemId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  companyName?: string | null;
  productName: string;
  saasAppCode: string;
  saasPlanCode?: string | null;
  licenseDays?: number | null;
  licenseMonths?: number | null;
  demo?: boolean;
}

export interface SaasProvisionResponse {
  ok: boolean;
  tenantId?: string;
  tenantSlug?: string;
  licenseKey?: string;
  loginUrl?: string;
  loginEmail?: string;
  temporaryPassword?: string;
  startsAt?: string;
  endsAt?: string;
  mailSentBySaas?: boolean;
  message?: string;
  error?: string;
}

function normalizeProvisionResponse(
  data: Record<string, unknown>,
  httpOk: boolean,
): SaasProvisionResponse {
  const ok = data.ok === true || data.success === true || (httpOk && !data.error);
  const tenantId =
    typeof data.tenantId === 'string'
      ? data.tenantId
      : typeof data.externalTenantId === 'string'
        ? data.externalTenantId
        : undefined;

  if (ok && tenantId) {
    return {
      ok: true,
      tenantId,
      tenantSlug:
        typeof data.tenantSlug === 'string'
          ? data.tenantSlug
          : typeof data.externalTenantSlug === 'string'
            ? data.externalTenantSlug
            : undefined,
      licenseKey:
        typeof data.licenseKey === 'string'
          ? data.licenseKey
          : typeof data.externalLicenseKey === 'string'
            ? data.externalLicenseKey
            : undefined,
      loginUrl: typeof data.loginUrl === 'string' ? data.loginUrl : undefined,
      loginEmail: typeof data.loginEmail === 'string' ? data.loginEmail : undefined,
      temporaryPassword:
        typeof data.temporaryPassword === 'string'
          ? data.temporaryPassword
          : undefined,
      startsAt:
        typeof data.startsAt === 'string'
          ? data.startsAt
          : typeof data.licenseStartDate === 'string'
            ? data.licenseStartDate
            : undefined,
      endsAt:
        typeof data.endsAt === 'string'
          ? data.endsAt
          : typeof data.licenseEndDate === 'string'
            ? data.licenseEndDate
            : undefined,
      mailSentBySaas: data.mailSentBySaas === true || data.mailSent === true,
      message: typeof data.message === 'string' ? data.message : undefined,
    };
  }

  return {
    ok: false,
    error:
      typeof data.error === 'string'
        ? data.error
        : typeof data.message === 'string'
          ? data.message
          : 'SaaS provisioning geçersiz yanıt döndü',
  };
}

export function isMuvekkilKasaSaasConfigured(): boolean {
  return Boolean(
    env.SAAS_PROVISIONING_ENABLED &&
      env.MUVEKKIL_KASA_SAAS_ENABLED &&
      env.MUVEKKIL_KASA_SAAS_API_URL?.trim() &&
      env.MUVEKKIL_KASA_SAAS_PROVISION_SECRET?.trim(),
  );
}

export function resolveSaasLoginUrl(provisionLoginUrl?: string | null): string | null {
  const fromProvision = provisionLoginUrl?.trim();
  if (fromProvision) return fromProvision;
  return env.MUVEKKIL_KASA_SAAS_APP_URL?.trim() || null;
}

async function fetchWithTimeout(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  const timeoutMs = env.MUVEKKIL_KASA_SAAS_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`SaaS API zaman aşımı (${timeoutMs}ms)`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function provisionMuvekkilKasaSaasTenant(
  payload: SaasProvisionPayload,
): Promise<SaasProvisionResponse> {
  if (!env.SAAS_PROVISIONING_ENABLED || !env.MUVEKKIL_KASA_SAAS_ENABLED) {
    return { ok: false, error: 'SaaS provisioning devre dışı' };
  }

  const baseUrl = env.MUVEKKIL_KASA_SAAS_API_URL?.replace(/\/$/, '');
  const secret = env.MUVEKKIL_KASA_SAAS_PROVISION_SECRET?.trim();

  if (!baseUrl || !secret) {
    return {
      ok: false,
      error:
        'SaaS API yapılandırılmamış (MUVEKKIL_KASA_SAAS_API_URL / MUVEKKIL_KASA_SAAS_PROVISION_SECRET)',
    };
  }

  const endpoint = `${baseUrl}/api/v1/integrations/woontegra-website/tenants/provision`;

  try {
    const response = await fetchWithTimeout(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-woontegra-website-provision-secret': secret,
      },
      body: JSON.stringify({
        externalOrderNo: payload.externalOrderNo,
        externalOrderItemId: payload.externalOrderItemId,
        customerName: payload.customerName,
        customerEmail: payload.customerEmail,
        customerPhone: payload.customerPhone ?? undefined,
        companyName: payload.companyName ?? undefined,
        productName: payload.productName,
        saasAppCode: payload.saasAppCode,
        saasPlanCode: payload.saasPlanCode ?? undefined,
        licenseDays: payload.licenseDays ?? undefined,
        licenseMonths: payload.licenseMonths ?? undefined,
        demo: payload.demo ?? false,
      }),
    });

    const data = (await response.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;

    if (response.status === 409 && data.alreadyExists === true) {
      const normalized = normalizeProvisionResponse(data, false);
      if (normalized.tenantId) {
        return { ...normalized, ok: true, message: 'SaaS hesabı zaten mevcut' };
      }
      return {
        ok: false,
        error: normalized.error ?? 'SaaS hesabı zaten oluşturulmuş',
      };
    }

    return normalizeProvisionResponse(data, response.ok);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'SaaS API bağlantı hatası',
    };
  }
}
