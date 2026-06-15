import { Request, Response } from 'express';
import prisma from '../config/prisma';

function sanitizeString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isSupportedUpload(value: string): boolean {
  return value.startsWith('data:image/') || value.startsWith('data:application/pdf');
}

export const setDriverActive = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (req.user?.role !== 'DRIVER' || !req.user?.isDriverVerified) {
      res.status(403).json({ message: 'Forbidden: Only verified drivers can toggle availability' });
      return;
    }

    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      res.status(400).json({ message: 'isActive must be a boolean' });
      return;
    }

    const profile = await prisma.driverProfile.findUnique({ where: { userId } });

    if (!profile) {
      res.status(404).json({ message: 'Driver profile not found' });
      return;
    }

    const updated = await prisma.driverProfile.update({
      where: { userId },
      data: { isActive },
      select: {
        id: true,
        userId: true,
        isActive: true,
        avgRating: true,
        totalTrips: true,
      },
    });

    res.status(200).json({
      message: 'Driver availability updated',
      data: updated,
    });
  } catch (error) {
    console.error('Set driver active error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const registerDriver = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const ktmUrl = sanitizeString(req.body.ktmUrl);
    const qrisUrl = sanitizeString(req.body.qrisUrl);

    if (!ktmUrl || !qrisUrl) {
      res.status(400).json({ message: 'ktmUrl and qrisUrl are required' });
      return;
    }

    if (!isSupportedUpload(ktmUrl) || !isSupportedUpload(qrisUrl)) {
      res.status(400).json({ message: 'ktmUrl and qrisUrl must be valid data URLs' });
      return;
    }

    const existingProfile = await prisma.driverProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (existingProfile) {
      res.status(409).json({ message: 'Driver application already exists' });
      return;
    }

    const profile = await prisma.driverProfile.create({
      data: {
        userId,
        ktmUrl,
        qrisUrl,
      },
      select: {
        id: true,
        userId: true,
        ktmUrl: true,
        qrisUrl: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      message: 'Driver application submitted successfully',
      data: {
        id: profile.id,
        userId: profile.userId,
        ktmUrl: profile.ktmUrl,
        qrisUrl: profile.qrisUrl,
        submittedAt: profile.createdAt,
      },
    });
  } catch (error) {
    console.error('Register driver error:', error);
    res.status(500).json({ message: 'Internal server error while submitting driver application' });
  }
};
