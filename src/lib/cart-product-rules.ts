import type { DeliveryMode, Product } from '@prisma/client';
import { ProductStatus } from '@prisma/client';
import { AppError } from './app-error.js';

const CART_ALLOWED_MODES: DeliveryMode[] = [
  'PAID_DOWNLOAD',
  'LICENSED_DOWNLOAD',
  'SAAS',
  'NONE',
];

export function assertProductCanBeAddedToCart(product: Product): void {
  if (product.status !== ProductStatus.ACTIVE) {
    throw AppError.badRequest('Ürün satışta değil');
  }

  if (product.deliveryMode === 'FREE_DOWNLOAD') {
    throw AppError.badRequest(
      'Ücretsiz indirilebilir ürünler sepete eklenemez',
    );
  }

  if (product.deliveryMode === 'QUOTE_ONLY') {
    throw AppError.badRequest('Teklif usulü ürünler sepete eklenemez');
  }

  if (!product.purchaseEnabled) {
    throw AppError.badRequest('Bu ürün doğrudan satın alınamaz');
  }

  if (!CART_ALLOWED_MODES.includes(product.deliveryMode)) {
    throw AppError.badRequest('Bu ürün sepete eklenemez');
  }
}

export function collectDeliveryModes(
  products: Array<{ deliveryMode: DeliveryMode }>,
): DeliveryMode[] {
  return [...new Set(products.map((product) => product.deliveryMode))];
}

export function buildFulfillmentMessages(
  deliveryModes: DeliveryMode[],
  paymentMethodType?: string | null,
  paymentStatus?: string | null,
): string[] {
  const messages: string[] = [];

  if (paymentMethodType === 'BANK_TRANSFER') {
    messages.push(
      'Havale/EFT ödemeniz onaylandıktan sonra dijital teslimat başlatılacaktır.',
    );
    if (deliveryModes.includes('SAAS')) {
      messages.push(
        'Ödemeniz onaylandıktan sonra SaaS hesabınız oluşturulacaktır.',
      );
    }
  }

  if (deliveryModes.includes('PAID_DOWNLOAD')) {
    messages.push(
      'Ödeme tamamlandıktan sonra indirme bağlantınız hazırlanacaktır.',
    );
  }

  if (deliveryModes.includes('LICENSED_DOWNLOAD')) {
    messages.push(
      'Ödeme tamamlandıktan sonra lisans ve kurulum bilgileriniz gönderilecektir.',
    );
  }

  if (deliveryModes.includes('SAAS')) {
    messages.push(
      'Ödeme tamamlandıktan sonra abonelik/hizmet hesabınız hazırlanacaktır.',
    );
  }

  if (
    paymentMethodType === 'PAYTR' &&
    paymentStatus === 'PENDING'
  ) {
    messages.push('Ödeme sonucunuz kontrol ediliyor.');
  }

  return [...new Set(messages)];
}

export function cartRequiresCustomerLogin(
  products: Array<{ deliveryMode: DeliveryMode; saasRequiresLogin: boolean }>,
): boolean {
  return products.some(
    (product) =>
      product.deliveryMode === 'SAAS' && product.saasRequiresLogin,
  );
}

export function assertSaasCheckoutAllowed(
  products: Array<{ deliveryMode: DeliveryMode; saasRequiresLogin: boolean }>,
  customerId?: string | null,
): void {
  if (cartRequiresCustomerLogin(products) && !customerId) {
    throw AppError.unauthorized(
      'SaaS aboneliği satın almak için hesabınıza giriş yapmanız gerekir.',
    );
  }
}
