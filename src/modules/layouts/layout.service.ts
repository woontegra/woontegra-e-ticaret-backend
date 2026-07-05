import { LayoutType, PageStatus } from '@prisma/client';
import { AppError } from '../../lib/app-error.js';
import { toInputJson } from '../../lib/json.js';
import {
  toPageBlockDto,
  toPageLayoutDto,
  toPublicHomeLayoutDto,
} from '../../lib/layout.mapper.js';
import { toPrismaBlockType } from '../../lib/block-types.js';
import { prisma } from '../../lib/prisma.js';
import type {
  CreatePageBlockInput,
  ReorderLayoutBlocksInput,
  UpdateHomeDraftInput,
  UpdatePageBlockInput,
} from './layout.schema.js';

const HOME_DRAFT_NAME = 'Ana Sayfa (Taslak)';

async function loadLayoutWithBlocks(layoutId: string) {
  const layout = await prisma.pageLayout.findUnique({
    where: { id: layoutId },
    include: {
      blocks: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
    },
  });

  if (!layout) {
    throw AppError.notFound('Layout not found');
  }

  return layout;
}

async function getNextBlockSortOrder(layoutId: string) {
  const last = await prisma.pageBlock.findFirst({
    where: { layoutId },
    orderBy: { sortOrder: 'desc' },
  });

  return (last?.sortOrder ?? -1) + 1;
}

export async function getOrCreateHomeDraft() {
  let layout = await prisma.pageLayout.findFirst({
    where: {
      layoutType: LayoutType.HOME,
      status: PageStatus.DRAFT,
      pageId: null,
    },
    include: {
      blocks: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
    },
  });

  if (!layout) {
    layout = await prisma.pageLayout.create({
      data: {
        layoutType: LayoutType.HOME,
        status: PageStatus.DRAFT,
        pageId: null,
        name: HOME_DRAFT_NAME,
      },
      include: {
        blocks: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
      },
    });
  }

  const blocks = layout.blocks.map(toPageBlockDto);
  return toPageLayoutDto(layout, blocks);
}

export async function updateHomeDraft(input: UpdateHomeDraftInput) {
  const layout = await prisma.pageLayout.findFirst({
    where: {
      layoutType: LayoutType.HOME,
      status: PageStatus.DRAFT,
      pageId: null,
    },
  });

  if (!layout) {
    throw AppError.notFound('Home draft layout not found');
  }

  const updated = await prisma.pageLayout.update({
    where: { id: layout.id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
    },
    include: {
      blocks: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
    },
  });

  return toPageLayoutDto(updated, updated.blocks.map(toPageBlockDto));
}

export async function createLayoutBlock(
  layoutId: string,
  input: CreatePageBlockInput,
) {
  await loadLayoutWithBlocks(layoutId);

  const sortOrder = input.sortOrder ?? (await getNextBlockSortOrder(layoutId));

  const block = await prisma.pageBlock.create({
    data: {
      layoutId,
      type: toPrismaBlockType(input.type),
      title: input.title ?? null,
      settings: toInputJson(input.settings ?? {}),
      content: toInputJson(input.content ?? {}),
      sortOrder,
      isActive: input.isActive ?? true,
    },
  });

  return toPageBlockDto(block);
}

export async function updateLayoutBlock(
  layoutId: string,
  blockId: string,
  input: UpdatePageBlockInput,
) {
  const existing = await prisma.pageBlock.findFirst({
    where: { id: blockId, layoutId },
  });

  if (!existing) {
    throw AppError.notFound('Block not found');
  }

  const block = await prisma.pageBlock.update({
    where: { id: blockId },
    data: {
      ...(input.type !== undefined ? { type: toPrismaBlockType(input.type) } : {}),
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.settings !== undefined
        ? { settings: toInputJson(input.settings) }
        : {}),
      ...(input.content !== undefined
        ? { content: toInputJson(input.content) }
        : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
  });

  return toPageBlockDto(block);
}

export async function deleteLayoutBlock(layoutId: string, blockId: string) {
  const existing = await prisma.pageBlock.findFirst({
    where: { id: blockId, layoutId },
  });

  if (!existing) {
    throw AppError.notFound('Block not found');
  }

  await prisma.pageBlock.delete({ where: { id: blockId } });
}

export async function reorderLayoutBlocks(
  layoutId: string,
  input: ReorderLayoutBlocksInput,
) {
  const layout = await loadLayoutWithBlocks(layoutId);
  const blockIds = input.items.map((item) => item.id);
  const existingIds = new Set(layout.blocks.map((block) => block.id));

  if (blockIds.some((id) => !existingIds.has(id))) {
    throw AppError.badRequest('Invalid block ids');
  }

  await prisma.$transaction(
    input.items.map((item) =>
      prisma.pageBlock.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      }),
    ),
  );

  const blocks = await prisma.pageBlock.findMany({
    where: { layoutId },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });

  return blocks.map(toPageBlockDto);
}

export async function publishLayout(layoutId: string) {
  const draft = await prisma.pageLayout.findFirst({
    where: {
      id: layoutId,
      layoutType: LayoutType.HOME,
      status: PageStatus.DRAFT,
      pageId: null,
    },
    include: {
      blocks: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
    },
  });

  if (!draft) {
    throw AppError.notFound('Home draft layout not found');
  }

  let published = await prisma.pageLayout.findFirst({
    where: {
      layoutType: LayoutType.HOME,
      status: PageStatus.PUBLISHED,
      pageId: null,
    },
  });

  if (!published) {
    published = await prisma.pageLayout.create({
      data: {
        layoutType: LayoutType.HOME,
        status: PageStatus.PUBLISHED,
        pageId: null,
        name: draft.name.replace('(Taslak)', '').trim() || 'Ana Sayfa',
        publishedAt: new Date(),
      },
    });
  } else {
    published = await prisma.pageLayout.update({
      where: { id: published.id },
      data: {
        name: draft.name.replace('(Taslak)', '').trim() || published.name,
        publishedAt: new Date(),
      },
    });
  }

  await prisma.$transaction(async (tx) => {
    await tx.pageBlock.deleteMany({ where: { layoutId: published!.id } });

    if (draft.blocks.length > 0) {
      await tx.pageBlock.createMany({
        data: draft.blocks.map((block) => ({
          layoutId: published!.id,
          type: block.type,
          title: block.title,
          settings: block.settings ?? {},
          content: block.content ?? {},
          sortOrder: block.sortOrder,
          isActive: block.isActive,
        })),
      });
    }
  });

  const result = await loadLayoutWithBlocks(published.id);
  return toPageLayoutDto(result, result.blocks.map(toPageBlockDto));
}

export async function getPublicHomeLayout() {
  const layout = await prisma.pageLayout.findFirst({
    where: {
      layoutType: LayoutType.HOME,
      status: PageStatus.PUBLISHED,
      pageId: null,
    },
    include: {
      blocks: {
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      },
    },
  });

  if (!layout) {
    return null;
  }

  return toPublicHomeLayoutDto(layout, layout.blocks);
}
