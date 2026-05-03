import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getModels = async (req: Request, res: Response): Promise<void> => {
  const { category } = req.query;
  const models = await prisma.model.findMany({
    where: category ? { category: category as string } : undefined,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { username: true } } },
  });
  res.status(200).json(models);
};

export const getModel = async (req: Request, res: Response): Promise<void> => {
  const model = await prisma.model.findUnique({
    where: { id: req.params.id as string },
    include: { user: { select: { id: true, username: true } } },
  });

  if (!model) {
    res.status(404).json({ message: 'Model not found' });
    return;
  }

  res.status(200).json(model);
};

export const createModel = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user?.id;
  const { title, description, category, previewImage, fileUrl, tags } = req.body;

  if (!title || !description || !category || !previewImage) {
    res.status(400).json({ message: 'title, description, category, and previewImage are required' });
    return;
  }

  const model = await prisma.model.create({
    data: {
      title,
      description,
      category,
      previewImage,
      fileUrl: fileUrl || null,
      tags: Array.isArray(tags) ? tags : [],
      userId,
    },
  });

  res.status(201).json(model);
};

export const deleteModel = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user?.id;
  const model = await prisma.model.findUnique({ where: { id: req.params.id as string } });

  if (!model) {
    res.status(404).json({ message: 'Model not found' });
    return;
  }

  if (model.userId !== userId) {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }

  await prisma.savedModel.deleteMany({ where: { modelId: model.id } });
  await prisma.model.delete({ where: { id: model.id } });

  res.status(200).json({ message: 'Model deleted' });
};
