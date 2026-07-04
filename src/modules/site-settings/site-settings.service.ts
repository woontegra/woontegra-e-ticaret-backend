import { SETTINGS_SINGLETON_ID } from '../../types/api.js';
import { prisma } from '../../lib/prisma.js';
import { toSiteSettingDto } from '../../lib/site-setting.mapper.js';
import type { UpdateSiteSettingInput } from './site-settings.schema.js';

async function getOrCreate() {
  return prisma.siteSetting.upsert({
    where: { id: SETTINGS_SINGLETON_ID },
    update: {},
    create: { id: SETTINGS_SINGLETON_ID },
  });
}

export async function getSiteSettings() {
  const setting = await getOrCreate();
  return toSiteSettingDto(setting);
}

export async function updateSiteSettings(input: UpdateSiteSettingInput) {
  const setting = await prisma.siteSetting.upsert({
    where: { id: SETTINGS_SINGLETON_ID },
    update: input,
    create: {
      id: SETTINGS_SINGLETON_ID,
      ...input,
    },
  });

  return toSiteSettingDto(setting);
}
