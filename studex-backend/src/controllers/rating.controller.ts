import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const createDriverRating = async (req: Request, res: Response): Promise<void> => {
  try {
    const fromUser = req.user?.id;
    if (!fromUser) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { orderId, score } = req.body;

    if (orderId === undefined || score === undefined) {
      res.status(400).json({ message: 'orderId and score are required' });
      return;
    }

    const parsedScore = Number.parseInt(score, 10);
    if (Number.isNaN(parsedScore) || parsedScore < 1 || parsedScore > 5) {
      res.status(400).json({ message: 'score must be an integer between 1 and 5' });
      return;
    }

    // Ambil order
    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
    });

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // Validasi kepemilikan dan status
    if (order.userId !== fromUser) {
      res.status(403).json({ message: 'Forbidden: Only the buyer of this order can submit a rating' });
      return;
    }

    if (order.status !== 'COMPLETED') {
      res.status(400).json({ message: 'Ratings can only be submitted for completed orders' });
      return;
    }

    if (!order.driverId) {
      res.status(400).json({ message: 'This order does not have an assigned driver' });
      return;
    }

    const toUser = order.driverId;

    // Cek apakah sudah pernah dirating
    const existingRating = await prisma.rating.findUnique({
      where: {
        orderId_fromUser: {
          orderId: order.id,
          fromUser,
        },
      },
    });

    if (existingRating) {
      res.status(409).json({ message: 'You have already submitted a rating for this order' });
      return;
    }

    // Buat rating
    const rating = await prisma.rating.create({
      data: {
        orderId: order.id,
        fromUser,
        toUser,
        score: parsedScore,
      },
    });

    // Hitung rata-rata rating
    const ratingStats = await prisma.rating.aggregate({
      where: { toUser },
      _avg: {
        score: true,
      },
    });

    // Hitung total trips completed
    const totalTrips = await prisma.order.count({
      where: {
        driverId: toUser,
        status: 'COMPLETED',
      },
    });

    const newAvgRating = ratingStats._avg.score !== null ? Number(ratingStats._avg.score.toFixed(2)) : 0.00;

    // Update Driver Profile
    await prisma.driverProfile.update({
      where: { userId: toUser },
      data: {
        avgRating: newAvgRating,
        totalTrips,
      },
    });

    res.status(201).json({
      message: 'Rating submitted successfully',
      data: rating,
    });
  } catch (error) {
    console.error('Create rating error:', error);
    res.status(500).json({ message: 'Internal server error while submitting rating' });
  }
};
