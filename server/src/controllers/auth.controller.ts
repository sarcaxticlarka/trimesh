import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

const signToken = (id: string) =>
  jwt.sign({ id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { email, username, password } = req.body;
  if (!email || !username || !password) {
    res.status(400).json({ message: 'All fields are required' });
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ message: 'Email already registered' });
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, username, password: hashed },
  });

  const token = signToken(user.id);
  res.status(201).json({
    token,
    user: { id: user.id, email: user.email, username: user.username },
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  const token = signToken(user.id);
  res.status(200).json({
    token,
    user: { id: user.id, email: user.email, username: user.username },
  });
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user?.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, username: true, bio: true, createdAt: true },
  });

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  res.status(200).json(user);
};
