import { SETTINGS_SINGLETON_ID } from '../../types/api.js';
import { toSeoSettingDto, toSeoSettingPublicDto } from '../../lib/seo.mapper.js';
import { prisma } from '../../lib/prisma.js';
import type { UpdateSeoSettingInput } from './seo.schema.js';

async function getOrCreate() {
  return prisma.seoSetting.upsert({
    where: { id: SETTINGS_SINGLETON_ID },
    update: {},
    create: { id: SETTINGS_SINGLETON_ID },
  });
}

export async function getSeoSettings() {
  const setting = await getOrCreate();
  return toSeoSettingDto(setting);
}

export async function getPublicSeoSettings() {
  const setting = await getOrCreate();
  return toSeoSettingPublicDto(setting);
}

export async function updateSeoSettings(input: UpdateSeoSettingInput) {
  const setting = await prisma.seoSetting.upsert({
    where: { id: SETTINGS_SINGLETON_ID },
    update: input,
    create: {
      id: SETTINGS_SINGLETON_ID,
      ...input,
    },
  });

  return toSeoSettingDto(setting);
}

export async function getSeoSettingRecord() {
  return getOrCreate();
}
