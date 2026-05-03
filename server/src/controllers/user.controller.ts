import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getDashboard = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user?.id;

  const [uploads, saved] = await Promise.all([
    prisma.model.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.savedModel.findMany({
      where: { userId },
      include: { model: { include: { user: { select: { username: true } } } } },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  res.status(200).json({ uploads, saved: saved.map((s: { model: unknown }) => s.model) });
};

export const saveModel = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user?.id;
  const modelId = req.params.modelId as string;

  const model = await prisma.model.findUnique({ where: { id: modelId } });
  if (!model) {
    res.status(404).json({ message: 'Model not found' });
    return;
  }

  const saved = await prisma.savedModel.upsert({
    where: { userId_modelId: { userId, modelId } },
    create: { userId, modelId },
    update: {},
  });

  res.status(200).json(saved);
};

export const unsaveModel = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user?.id;
  const modelId = req.params.modelId as string;

  await prisma.savedModel.deleteMany({ where: { userId, modelId } });

  res.status(200).json({ message: 'Removed from saved' });
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user?.id;
  const { username, bio } = req.body;

  if (!username?.trim()) {
    res.status(400).json({ message: 'Username is required' });
    return;
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { username: username.trim(), bio: bio?.trim() || null },
    select: { id: true, email: true, username: true, bio: true },
  });

  res.status(200).json(user);
};

export const getStats = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user?.id;

  const [uploadCount, savedCount, totalDownloads] = await Promise.all([
    prisma.model.count({ where: { userId } }),
    prisma.savedModel.count({ where: { userId } }),
    prisma.model.aggregate({ where: { userId }, _sum: { downloadCount: true } }),
  ]);

  res.status(200).json({
    uploads: uploadCount,
    saved: savedCount,
    totalDownloads: totalDownloads._sum.downloadCount ?? 0,
  });
};
