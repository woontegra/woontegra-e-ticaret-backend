import { AppError } from '../../lib/app-error.js';
import {
  toCampaignDto,
  toCampaignPublicDto,
} from '../../lib/promotion.mapper.js';
import { prisma } from '../../lib/prisma.js';
import { isCampaignActive } from './coupon-engine.service.js';
import type { CreateCampaignInput, ListCampaignsQuery, UpdateCampaignInput } from './promotion.schema.js';
import { resolvePagination } from '../../lib/pagination.js';

export async function listCampaigns(query: ListCampaignsQuery = {}) {
  const where = {
    ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' as const } },
            { title: { contains: query.search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  const { skip, limit } = resolvePagination(query);

  const [items, total] = await Promise.all([
    prisma.campaign.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.campaign.count({ where }),
  ]);

  return {
    items: await Promise.all(items.map(toCampaignDto)),
    total,
  };
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
