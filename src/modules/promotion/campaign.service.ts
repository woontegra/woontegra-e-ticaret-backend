import { AppError } from '../../lib/app-error.js';
import {
  toCampaignDto,
  toCampaignPublicDto,
} from '../../lib/promotion.mapper.js';
import { prisma } from '../../lib/prisma.js';
import { isCampaignActive } from './coupon-engine.service.js';
import type { CreateCampaignInput, UpdateCampaignInput } from './promotion.schema.js';

export async function listCampaigns() {
  const items = await prisma.campaign.findMany({ orderBy: { createdAt: 'desc' } });
  return Promise.all(items.map(toCampaignDto));
}

export async function getCampaignById(id: string) {
  const campaign = await prisma.campaign.findUnique({ where: { id } });
  if (!campaign) throw AppError.notFound('Campaign not found');
  return await toCampaignDto(campaign);
}

export async function createCampaign(input: CreateCampaignInput) {
  const campaign = await prisma.campaign.create({
    data: {
      name: input.name,
      type: input.type,
      bannerImageId: input.bannerImageId ?? null,
      title: input.title,
      description: input.description ?? null,
      buttonText: input.buttonText ?? null,
      buttonUrl: input.buttonUrl ?? null,
      startsAt: input.startsAt ?? null,
      endsAt: input.endsAt ?? null,
      isActive: input.isActive ?? true,
    },
  });
  return toCampaignDto(campaign);
}

export async function updateCampaign(id: string, input: UpdateCampaignInput) {
  const existing = await prisma.campaign.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('Campaign not found');

  const campaign = await prisma.campaign.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.bannerImageId !== undefined
        ? { bannerImageId: input.bannerImageId }
        : {}),
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.buttonText !== undefined ? { buttonText: input.buttonText } : {}),
      ...(input.buttonUrl !== undefined ? { buttonUrl: input.buttonUrl } : {}),
      ...(input.startsAt !== undefined ? { startsAt: input.startsAt } : {}),
      ...(input.endsAt !== undefined ? { endsAt: input.endsAt } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
  });

  return toCampaignDto(campaign);
}

export async function deleteCampaign(id: string) {
  const existing = await prisma.campaign.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('Campaign not found');
  await prisma.campaign.delete({ where: { id } });
}

export async function listActiveCampaigns() {
  const items = await prisma.campaign.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });
  const active = items.filter((item) => isCampaignActive(item));
  return Promise.all(active.map(toCampaignPublicDto));
}

export async function getPublicCampaignById(id: string) {
  const campaign = await prisma.campaign.findUnique({ where: { id } });
  if (!campaign || !isCampaignActive(campaign)) {
    throw AppError.notFound('Campaign not found');
  }
  return toCampaignPublicDto(campaign);
}
