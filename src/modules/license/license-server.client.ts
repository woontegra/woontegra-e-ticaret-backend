import { env } from '../../config/index.js';

export interface CreateOrderLicensePayload {
  externalOrderNo: string;
  externalOrderItemId: string;
  externalUnitKey: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  productName: string;
  licenseAppCode: string;
  licenseDays?: number | null;
  licenseMonths?: number | null;
  licenseMaxDevices?: number | null;
  quantity?: number;
}

export interface OrderLicenseResponse {
  ok: boolean;
  licenseKey?: string;
  activationPassword?: string;
  expiresAt?: string;
  message?: string;
  error?: string;
}

export interface LicenseProgramDto {
  appCode: string;
  name: string;
  isActive: boolean;
  defaultLicenseDays: number;
  defaultMaxDevices: number;
  description?: string | null;
}

function normalizeLicenseResponse(
  data: Record<string, unknown>,
  httpOk: boolean,
): OrderLicenseResponse {
  const ok = data.ok === true || data.success === true || (httpOk && !data.error);
  const licenseKey =
    typeof data.licenseKey === 'string' ? data.licenseKey : undefined;
  const activationPassword =
    typeof data.activationPassword === 'string'
      ? data.activationPassword
      : undefined;
  const expiresAt =
    typeof data.expiresAt === 'string' ? data.expiresAt : undefined;
  const message =
    typeof data.message === 'string'
      ? data.message
      : typeof data.error === 'string'
        ? data.error
        : undefined;

  if (ok && licenseKey) {
    return { ok: true, licenseKey, activationPassword, expiresAt, message };
  }

  return {
    ok: false,
    error:
      typeof data.error === 'string'
        ? data.error
        : typeof data.message === 'string'
          ? data.message
          : 'Lisans sunucusu geçersiz yanıt döndü',
  };
}

export function isLicenseServerConfigured(): boolean {
  return Boolean(
    env.LICENSE_SERVER_ENABLED &&
      env.LICENSE_SERVER_URL?.trim() &&
      env.LICENSE_SERVER_INTEGRATION_SECRET?.trim(),
  );
}

async function fetchWithTimeout(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  const timeoutMs = env.LICENSE_SERVER_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Lisans sunucusu zaman aşımı (${timeoutMs}ms)`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function licenseServerFetch(
  path: string,
  init?: RequestInit,
): Promise<{ ok: boolean; status: number; data: Record<string, unknown> }> {
  if (!env.LICENSE_SERVER_ENABLED) {
    return {
      ok: false,
      status: 503,
      data: { error: 'Lisans sunucusu entegrasyonu devre dışı' },
    };
  }

  const baseUrl = env.LICENSE_SERVER_URL?.replace(/\/$/, '');
  const secret = env.LICENSE_SERVER_INTEGRATION_SECRET?.trim();

  if (!baseUrl || !secret) {
    return {
      ok: false,
      status: 503,
      data: {
        error:
          'Lisans sunucusu yapılandırılmamış (LICENSE_SERVER_URL / LICENSE_SERVER_INTEGRATION_SECRET)',
      },
    };
  }

  try {
    const response = await fetchWithTimeout(`${baseUrl}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        'x-integration-secret': secret,
        ...(init?.headers ?? {}),
      },
    });

    const data = (await response.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;

    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Lisans sunucusuna ulaşılamadı';
    return { ok: false, status: 503, data: { error: message } };
  }
}

export async function createOrderLicense(
  payload: CreateOrderLicensePayload,
): Promise<OrderLicenseResponse> {
  const result = await licenseServerFetch('/api/integrations/website/order-license', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      externalOrderNo: payload.externalOrderNo,
      externalOrderItemId: payload.externalOrderItemId,
      externalUnitKey: payload.externalUnitKey,
      customerName: payload.customerName,
      customerEmail: payload.customerEmail,
      customerPhone: payload.customerPhone ?? undefined,
      productName: payload.productName,
      licenseAppCode: payload.licenseAppCode,
      licenseDays: payload.licenseDays ?? undefined,
      licenseMonths: payload.licenseMonths ?? undefined,
      licenseMaxDevices: payload.licenseMaxDevices ?? undefined,
      quantity: payload.quantity ?? 1,
    }),
  });

  if (result.status === 409 && result.data.alreadyExists === true) {
    const normalized = normalizeLicenseResponse(result.data, false);
    if (normalized.licenseKey) {
      return { ...normalized, ok: true, message: 'Lisans zaten mevcut' };
    }
    return {
      ok: false,
      error: normalized.error ?? 'Lisans zaten oluşturulmuş',
    };
  }

  return normalizeLicenseResponse(result.data, result.ok);
}

function mapProgram(row: Record<string, unknown>): LicenseProgramDto | null {
  const appCode =
    typeof row.appCode === 'string'
      ? row.appCode
      : typeof row.licenseAppCode === 'string'
        ? row.licenseAppCode
        : null;
  const name =
    typeof row.name === 'string'
      ? row.name
      : typeof row.programName === 'string'
        ? row.programName
        : null;

  if (!appCode || !name) return null;

  return {
    appCode,
    name,
    isActive: row.isActive !== false,
    defaultLicenseDays:
      typeof row.defaultLicenseDays === 'number' && row.defaultLicenseDays > 0
        ? row.defaultLicenseDays
        : 365,
    defaultMaxDevices:
      typeof row.defaultMaxDevices === 'number' && row.defaultMaxDevices > 0
        ? row.defaultMaxDevices
        : 1,
    description:
      typeof row.description === 'string' ? row.description : null,
  };
}

export async function fetchLicensePrograms(activeOnly = true): Promise<{
  programs: LicenseProgramDto[];
  error?: string;
}> {
  const query = activeOnly ? '?activeOnly=true' : '';
  const result = await licenseServerFetch(
    `/api/integrations/website/programs${query}`,
  );

  if (!result.ok) {
    return {
      programs: [],
      error:
        typeof result.data.error === 'string'
          ? result.data.error
          : `HTTP ${result.status}`,
    };
  }

  const rows = Array.isArray(result.data)
    ? result.data
    : Array.isArray(result.data.programs)
      ? result.data.programs
      : [];

  const programs = rows
    .map((row) => mapProgram(row as Record<string, unknown>))
    .filter((program): program is LicenseProgramDto => program !== null);

  return { programs };
}
