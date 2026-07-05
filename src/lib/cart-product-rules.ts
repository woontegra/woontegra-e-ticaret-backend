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

  if (paymentStatus === 'FAILED') {
    messages.push('Ödeme başarısız oldu. Lütfen tekrar deneyin veya farklı bir yöntem seçin.');
    return messages;
  }

  if (paymentStatus === 'PENDING' && paymentMethodType === 'PAYTR') {
    messages.push('Ödeme sonucunuz kontrol ediliyor.');
  }

  if (
    paymentStatus === 'WAITING_BANK_TRANSFER' ||
    (paymentMethodType === 'BANK_TRANSFER' && paymentStatus !== 'PAID')
  ) {
    messages.push(
      'Ödemeniz onaylandıktan sonra teslimat yapılacaktır.',
    );
  }

  if (paymentStatus === 'PAID') {
    if (deliveryModes.includes('PAID_DOWNLOAD')) {
      messages.push(
        'İndirme linkleriniz hazırlandı veya e-posta ile gönderildi.',
      );
    }
    if (deliveryModes.includes('LICENSED_DOWNLOAD')) {
      messages.push(
        'Kurulum ve lisans bilgileriniz hazırlanmıştır.',
      );
    }
    if (deliveryModes.includes('SAAS')) {
      messages.push('SaaS hesabınız hazırlanmıştır.');
    }
    return [...new Set(messages)];
  }

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

  if (deliveryModes.includes('PAID_DOWNLOAD') && paymentStatus !== 'PAID') {
    messages.push(
      'Ödeme tamamlandıktan sonra indirme bağlantınız hazırlanacaktır.',
    );
  }

  if (deliveryModes.includes('LICENSED_DOWNLOAD') && paymentStatus !== 'PAID') {
    messages.push(
      'Ödeme tamamlandıktan sonra lisans ve kurulum bilgileriniz gönderilecektir.',
    );
  }

  if (deliveryModes.includes('SAAS') && paymentStatus !== 'PAID') {
    messages.push(
      'Ödeme tamamlandıktan sonra abonelik/hizmet hesabınız hazırlanacaktır.',
    );
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
