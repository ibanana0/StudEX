import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const createReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const reporterId = req.user?.id;
    if (!reporterId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { reportedId, orderId, reason, details } = req.body;

    if (!reportedId || !reason || !details) {
      res.status(400).json({ message: 'reportedId, reason, and details are required' });
      return;
    }

    const parsedReportedId = Number(reportedId);
    if (Number.isNaN(parsedReportedId)) {
      res.status(400).json({ message: 'Invalid reportedId' });
      return;
    }

    if (parsedReportedId === reporterId) {
      res.status(400).json({ message: 'You cannot report yourself' });
      return;
    }

    // Verify reported user exists
    const reportedUser = await prisma.user.findUnique({
      where: { id: parsedReportedId },
      select: { id: true },
    });

    if (!reportedUser) {
      res.status(404).json({ message: 'Reported user not found' });
      return;
    }

    // Verify order exists and user is part of it (if orderId provided)
    let parsedOrderId: number | null = null;
    if (orderId !== undefined && orderId !== null) {
      parsedOrderId = Number(orderId);
      if (Number.isNaN(parsedOrderId)) {
        res.status(400).json({ message: 'Invalid orderId' });
        return;
      }

      const order = await prisma.order.findUnique({
        where: { id: parsedOrderId },
        select: { id: true, userId: true, driverId: true },
      });

      if (!order) {
        res.status(404).json({ message: 'Order not found' });
        return;
      }

      // Only buyer or driver of the order can report
      if (order.userId !== reporterId && order.driverId !== reporterId) {
        res.status(403).json({ message: 'Forbidden: You are not part of this order' });
        return;
      }

      // Reported user must be part of the order
      if (order.userId !== parsedReportedId && order.driverId !== parsedReportedId) {
        res.status(400).json({ message: 'Reported user is not part of this order' });
        return;
      }
    }

    const report = await prisma.report.create({
      data: {
        reporterId,
        reportedId: parsedReportedId,
        orderId: parsedOrderId,
        reason,
        details,
      },
    });

    res.status(201).json({
      message: 'Report submitted successfully',
      data: report,
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ message: 'Internal server error while submitting report' });
  }
};
