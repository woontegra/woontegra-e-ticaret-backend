import type { Prisma } from '@prisma/client';
import type { MailTemplateVariableDto } from '../../types/api.js';

export interface DefaultMailTemplate {
  key: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: MailTemplateVariableDto[];
}

const baseStyle =
  'font-family:Arial,sans-serif;line-height:1.5;color:#1e293b;max-width:560px;margin:0 auto;';

export const DEFAULT_MAIL_TEMPLATES: DefaultMailTemplate[] = [
  {
    key: 'ORDER_CREATED',
    name: 'Sipariş oluşturuldu',
    subject: 'Siparişiniz alındı — {{orderNumber}}',
    htmlContent: `<div style="${baseStyle}">
<p>Merhaba {{customerName}},</p>
<p><strong>{{orderNumber}}</strong> numaralı siparişiniz alındı.</p>
<p>Toplam: <strong>{{grandTotal}}</strong></p>
{{orderItemsHtml}}
<p>Teşekkür ederiz,<br>{{siteName}}</p>
</div>`,
    textContent:
      'Merhaba {{customerName}},\n\n{{orderNumber}} numaralı siparişiniz alındı.\nToplam: {{grandTotal}}\n\nTeşekkür ederiz,\n{{siteName}}',
    variables: [
      { name: 'customerName', description: 'Müşteri adı' },
      { name: 'orderNumber', description: 'Sipariş numarası' },
      { name: 'grandTotal', description: 'Genel toplam (formatlı)' },
      { name: 'orderItemsHtml', description: 'Ürün kalemleri HTML tablosu' },
      { name: 'siteName', description: 'Site adı' },
    ],
  },
  {
    key: 'PAYMENT_RECEIVED',
    name: 'Ödeme alındı',
    subject: 'Ödemeniz alındı — {{orderNumber}}',
    htmlContent: `<div style="${baseStyle}">
<p>Merhaba {{customerName}},</p>
<p><strong>{{orderNumber}}</strong> numaralı siparişiniz için ödemeniz alındı.</p>
<p>Tutar: <strong>{{grandTotal}}</strong></p>
<p>{{siteName}}</p>
</div>`,
    textContent:
      'Merhaba {{customerName}},\n\n{{orderNumber}} siparişiniz için ödemeniz alındı.\nTutar: {{grandTotal}}\n\n{{siteName}}',
    variables: [
      { name: 'customerName', description: 'Müşteri adı' },
      { name: 'orderNumber', description: 'Sipariş numarası' },
      { name: 'grandTotal', description: 'Genel toplam' },
      { name: 'siteName', description: 'Site adı' },
    ],
  },
  {
    key: 'BANK_TRANSFER_WAITING',
    name: 'Havale bekleniyor',
    subject: 'Havale/EFT bekleniyor — {{orderNumber}}',
    htmlContent: `<div style="${baseStyle}">
<p>Merhaba {{customerName}},</p>
<p><strong>{{orderNumber}}</strong> numaralı siparişiniz için havale/EFT bekleniyor.</p>
<p>Ödenecek tutar: <strong>{{grandTotal}}</strong></p>
<p>{{bankInfoHtml}}</p>
<p>{{siteName}}</p>
</div>`,
    textContent:
      'Merhaba {{customerName}},\n\n{{orderNumber}} için havale bekleniyor.\nTutar: {{grandTotal}}\n\n{{bankInfoText}}\n\n{{siteName}}',
    variables: [
      { name: 'customerName', description: 'Müşteri adı' },
      { name: 'orderNumber', description: 'Sipariş numarası' },
      { name: 'grandTotal', description: 'Genel toplam' },
      { name: 'bankInfoHtml', description: 'Banka hesapları HTML' },
      { name: 'bankInfoText', description: 'Banka hesapları düz metin' },
      { name: 'siteName', description: 'Site adı' },
    ],
  },
  {
    key: 'ORDER_SHIPPED',
    name: 'Sipariş kargoya verildi',
    subject: 'Siparişiniz kargoda — {{orderNumber}}',
    htmlContent: `<div style="${baseStyle}">
<p>Merhaba {{customerName}},</p>
<p><strong>{{orderNumber}}</strong> numaralı siparişiniz kargoya verildi.</p>
<p>Kargo firması: {{carrierName}}<br>Takip no: {{trackingNumber}}</p>
<p><a href="{{trackingUrl}}">Kargoyu takip et</a></p>
<p>{{siteName}}</p>
</div>`,
    textContent:
      'Merhaba {{customerName}},\n\n{{orderNumber}} kargoya verildi.\nTakip: {{trackingNumber}}\n{{trackingUrl}}\n\n{{siteName}}',
    variables: [
      { name: 'customerName', description: 'Müşteri adı' },
      { name: 'orderNumber', description: 'Sipariş numarası' },
      { name: 'carrierName', description: 'Kargo firması' },
      { name: 'trackingNumber', description: 'Takip numarası' },
      { name: 'trackingUrl', description: 'Takip linki' },
      { name: 'siteName', description: 'Site adı' },
    ],
  },
  {
    key: 'ORDER_DELIVERED',
    name: 'Sipariş teslim edildi',
    subject: 'Siparişiniz teslim edildi — {{orderNumber}}',
    htmlContent: `<div style="${baseStyle}">
<p>Merhaba {{customerName}},</p>
<p><strong>{{orderNumber}}</strong> numaralı siparişiniz teslim edildi.</p>
<p>Bizi tercih ettiğiniz için teşekkür ederiz.</p>
<p>{{siteName}}</p>
</div>`,
    textContent:
      'Merhaba {{customerName}},\n\n{{orderNumber}} teslim edildi.\n\nTeşekkürler,\n{{siteName}}',
    variables: [
      { name: 'customerName', description: 'Müşteri adı' },
      { name: 'orderNumber', description: 'Sipariş numarası' },
      { name: 'siteName', description: 'Site adı' },
    ],
  },
  {
    key: 'PASSWORD_RESET',
    name: 'Şifre sıfırlama',
    subject: 'Şifre sıfırlama — {{siteName}}',
    htmlContent: `<div style="${baseStyle}">
<p>Merhaba {{customerName}},</p>
<p>Şifrenizi sıfırlamak için aşağıdaki bağlantıyı kullanın:</p>
<p><a href="{{resetUrl}}">Şifremi sıfırla</a></p>
<p>Bu talebi siz yapmadıysanız bu e-postayı yok sayın.</p>
<p>{{siteName}}</p>
</div>`,
    textContent:
      'Merhaba {{customerName}},\n\nŞifre sıfırlama: {{resetUrl}}\n\n{{siteName}}',
    variables: [
      { name: 'customerName', description: 'Kullanıcı adı' },
      { name: 'resetUrl', description: 'Sıfırlama bağlantısı' },
      { name: 'siteName', description: 'Site adı' },
    ],
  },
  {
    key: 'CONTACT_REPLY',
    name: 'İletişim yanıtı',
    subject: 'Mesajınıza yanıt — {{siteName}}',
    htmlContent: `<div style="${baseStyle}">
<p>Merhaba {{name}},</p>
<p>Mesajınıza yanıt:</p>
<blockquote style="border-left:3px solid #e2e8f0;padding-left:12px;color:#475569;">{{replyMessage}}</blockquote>
<p>Orijinal mesajınız:</p>
<p style="color:#64748b;">{{message}}</p>
<p>{{siteName}}</p>
</div>`,
    textContent:
      'Merhaba {{name}},\n\nYanıt: {{replyMessage}}\n\nMesajınız: {{message}}\n\n{{siteName}}',
    variables: [
      { name: 'name', description: 'Gönderen adı' },
      { name: 'message', description: 'Orijinal mesaj' },
      { name: 'replyMessage', description: 'Yanıt metni' },
      { name: 'siteName', description: 'Site adı' },
    ],
  },
  {
    key: 'REVIEW_APPROVED',
    name: 'Yorum onaylandı',
    subject: 'Yorumunuz yayınlandı — {{siteName}}',
    htmlContent: `<div style="${baseStyle}">
<p>Merhaba {{customerName}},</p>
<p><strong>{{productName}}</strong> için yazdığınız yorum yayınlandı.</p>
<p>Teşekkür ederiz,<br>{{siteName}}</p>
</div>`,
    textContent:
      'Merhaba {{customerName}},\n\n{{productName}} yorumunuz yayınlandı.\n\n{{siteName}}',
    variables: [
      { name: 'customerName', description: 'Müşteri adı' },
      { name: 'productName', description: 'Ürün adı' },
      { name: 'siteName', description: 'Site adı' },
    ],
  },
  {
    key: 'DIGITAL_DOWNLOAD_READY',
    name: 'Dijital indirme hazır',
    subject: 'Woontegra Kurulum Dosyalarınız Hazır',
    htmlContent: `<div style="${baseStyle}">
<p>Merhaba {{customerName}},</p>
<p><strong>{{orderNumber}}</strong> numaralı siparişiniz için indirme bağlantılarınız hazır.</p>
<p>Ürün: <strong>{{productName}}</strong></p>
{{downloadLinksHtml}}
<p>Bağlantılar <strong>{{expiresAt}}</strong> tarihine kadar geçerlidir.</p>
<p>{{licenseNote}}</p>
<p>Sorularınız için: <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></p>
<p>Teşekkür ederiz,<br>{{siteName}}</p>
</div>`,
    textContent:
      'Merhaba {{customerName}},\n\n{{orderNumber}} siparişiniz için indirme bağlantılarınız hazır.\n\nÜrün: {{productName}}\n\n{{downloadLinksText}}\n\nBağlantılar {{expiresAt}} tarihine kadar geçerlidir.\n\n{{licenseNote}}\n\nDestek: {{supportEmail}}\n\n{{siteName}}',
    variables: [
      { name: 'customerName', description: 'Müşteri adı' },
      { name: 'orderNumber', description: 'Sipariş numarası' },
      { name: 'productName', description: 'Ürün adı' },
      { name: 'downloadLinks', description: 'İndirme bağlantıları (metin)' },
      { name: 'downloadLinksHtml', description: 'İndirme bağlantıları HTML' },
      { name: 'downloadLinksText', description: 'İndirme bağlantıları düz metin' },
      { name: 'expiresAt', description: 'Link geçerlilik tarihi' },
      { name: 'supportEmail', description: 'Destek e-postası' },
      { name: 'licenseNote', description: 'Lisans notu' },
      { name: 'siteName', description: 'Site adı' },
    ],
  },
];

export function defaultTemplateSeedData(): Array<{
  key: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: Prisma.InputJsonValue;
  isActive: boolean;
}> {
  return DEFAULT_MAIL_TEMPLATES.map((template) => ({
    key: template.key,
    name: template.name,
    subject: template.subject,
    htmlContent: template.htmlContent,
    textContent: template.textContent,
    variables: template.variables as unknown as Prisma.InputJsonValue,
    isActive: true,
  }));
}
