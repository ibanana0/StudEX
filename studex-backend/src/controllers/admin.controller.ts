import { Request, Response } from 'express';
import prisma from '../config/prisma';

function parseRouteId(rawId: string | string[] | undefined): number | null {
  const routeValue = Array.isArray(rawId) ? rawId[0] : rawId;
  const parsed = Number.parseInt(routeValue ?? '', 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export const getPendingDrivers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const pendingDrivers = await prisma.driverProfile.findMany({
      where: {
        user: {
          isDriverVerified: false,
        },
      },
      select: {
        id: true,
        userId: true,
        ktmUrl: true,
        qrisUrl: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePic: true,
            phoneNumber: true,
            role: true,
            isDriverVerified: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const data = pendingDrivers.map((driverProfile) => ({
      id: driverProfile.id,
      userId: driverProfile.userId,
      ktmUrl: driverProfile.ktmUrl,
      qrisUrl: driverProfile.qrisUrl,
      submittedAt: driverProfile.createdAt,
      user: driverProfile.user,
    }));

    res.status(200).json({
      message: 'Pending drivers fetched successfully',
      data,
    });
  } catch (error) {
    console.error('Error fetching pending drivers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const verifyDriver = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsedUserId = parseRouteId(req.params.userId);

    if (!parsedUserId) {
      res.status(400).json({ message: 'Invalid User ID' });
      return;
    }

    const profile = await prisma.driverProfile.findUnique({
      where: { userId: parsedUserId },
      select: { userId: true },
    });

    if (!profile) {
      res.status(404).json({ message: 'Driver profile not found' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: parsedUserId },
      data: {
        isDriverVerified: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isDriverVerified: true,
      },
    });

    res.status(200).json({
      message: 'Driver verified successfully',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error verifying driver:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const rejectDriver = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsedUserId = parseRouteId(req.params.userId);

    if (!parsedUserId) {
      res.status(400).json({ message: 'Invalid User ID' });
      return;
    }

    const profile = await prisma.driverProfile.findUnique({
      where: { userId: parsedUserId },
      select: { userId: true },
    });

    if (!profile) {
      res.status(404).json({ message: 'Driver profile not found' });
      return;
    }

    await prisma.driverProfile.delete({
      where: { userId: parsedUserId },
    });

    res.status(200).json({
      message: 'Driver application rejected and profile deleted successfully',
    });
  } catch (error) {
    console.error('Error rejecting driver:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
