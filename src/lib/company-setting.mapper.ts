import type { CompanySetting } from '@prisma/client';
import type { CompanySettingDto, SocialLinks } from '@woontegra/shared';

function parseSocialLinks(value: unknown): SocialLinks {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as SocialLinks;
}

export function toCompanySettingDto(setting: CompanySetting): CompanySettingDto {
  return {
    id: setting.id,
    companyName: setting.companyName,
    tradeName: setting.tradeName,
    taxNumber: setting.taxNumber,
    taxOffice: setting.taxOffice,
    mersisNumber: setting.mersisNumber,
    address: setting.address,
    city: setting.city,
    district: setting.district,
    phone: setting.phone,
    whatsapp: setting.whatsapp,
    email: setting.email,
    supportEmail: setting.supportEmail,
    workingHours: setting.workingHours,
    currency: setting.currency,
    defaultTaxRate: Number(setting.defaultTaxRate),
    socialLinks: parseSocialLinks(setting.socialLinks),
    createdAt: setting.createdAt.toISOString(),
    updatedAt: setting.updatedAt.toISOString(),
  };
}
