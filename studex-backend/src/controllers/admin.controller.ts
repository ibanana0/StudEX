import { Request, Response } from 'express';
import prisma from '../config/prisma';

// 1. Ambil daftar driver pending (punya profile tapi isDriverVerified = false)
export const getPendingDrivers = async (req: Request, res: Response): Promise<void> => {
  try {
    const pendingDrivers = await prisma.driverProfile.findMany({
      where: {
        user: {
          isDriverVerified: false,
        },
      },
      include: {
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

    res.status(200).json({
      message: 'Pending drivers fetched successfully',
      data: pendingDrivers,
    });
  } catch (error) {
    console.error('Error fetching pending drivers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 2. Setujui pendaftaran driver (isDriverVerified = true & role = 'DRIVER')
export const verifyDriver = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId as string;
    const parsedUserId = parseInt(userId, 10);

    if (isNaN(parsedUserId)) {
      res.status(400).json({ message: 'Invalid User ID' });
      return;
    }

    // Cek apakah driver profile ada
    const profile = await prisma.driverProfile.findUnique({
      where: { userId: parsedUserId },
    });

    if (!profile) {
      res.status(404).json({ message: 'Driver profile not found' });
      return;
    }

    // Update user: isDriverVerified = true dan role = 'DRIVER'
    const updatedUser = await prisma.$transaction(async (tx) => {
      return tx.user.update({
        where: { id: parsedUserId },
        data: {
          isDriverVerified: true,
          role: 'DRIVER',
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isDriverVerified: true,
        },
      });
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

// 3. Tolak pendaftaran driver (hapus driver profile)
export const rejectDriver = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId as string;
    const parsedUserId = parseInt(userId, 10);

    if (isNaN(parsedUserId)) {
      res.status(400).json({ message: 'Invalid User ID' });
      return;
    }

    // Cek apakah driver profile ada
    const profile = await prisma.driverProfile.findUnique({
      where: { userId: parsedUserId },
    });

    if (!profile) {
      res.status(404).json({ message: 'Driver profile not found' });
      return;
    }

    // Hapus profile driver agar user bisa mendaftar ulang jika perlu
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
