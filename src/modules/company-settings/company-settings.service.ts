import { SETTINGS_SINGLETON_ID } from '../../types/api.js';
import { prisma } from '../../lib/prisma.js';
import { toCompanySettingDto } from '../../lib/company-setting.mapper.js';
import type { UpdateCompanySettingInput } from './company-settings.schema.js';

async function getOrCreate() {
  return prisma.companySetting.upsert({
    where: { id: SETTINGS_SINGLETON_ID },
    update: {},
    create: { id: SETTINGS_SINGLETON_ID },
  });
}

export async function getCompanySettings() {
  const setting = await getOrCreate();
  return toCompanySettingDto(setting);
}

export async function updateCompanySettings(input: UpdateCompanySettingInput) {
  const { socialLinks, defaultTaxRate, contactLabels, ...rest } = input;

  const setting = await prisma.companySetting.upsert({
    where: { id: SETTINGS_SINGLETON_ID },
    update: {
      ...rest,
      ...(defaultTaxRate !== undefined ? { defaultTaxRate } : {}),
      ...(socialLinks !== undefined ? { socialLinks } : {}),
      ...(contactLabels !== undefined ? { contactLabels } : {}),
    },
    create: {
      id: SETTINGS_SINGLETON_ID,
      ...rest,
      ...(defaultTaxRate !== undefined ? { defaultTaxRate } : {}),
      ...(socialLinks !== undefined ? { socialLinks } : {}),
      ...(contactLabels !== undefined ? { contactLabels } : {}),
    },
  });

  return toCompanySettingDto(setting);
}
