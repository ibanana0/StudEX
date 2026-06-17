import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AccountStatus, ReportStatus, OrderStatus, CancelledBy } from '@prisma/client';

function parseRouteId(rawId: string | string[] | undefined): number | null {
  const routeValue = Array.isArray(rawId) ? rawId[0] : rawId;
  const parsed = Number.parseInt(routeValue ?? '', 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function mergeStepTimestamps(existing: unknown, status: string, iso: string): any {
  const base =
    existing && typeof existing === 'object' && !Array.isArray(existing)
      ? { ...(existing as Record<string, string>) }
      : {};
  base[status] = iso;
  return base;
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

    const data = pendingDrivers.map((driverProfile: any) => ({
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

// ── Report Management ───────────────────────────────────────────────────────

export const getPendingReports = async (_req: Request, res: Response): Promise<void> => {
  try {
    const reports = await prisma.report.findMany({
      where: { status: 'PENDING' },
      include: {
        reporter: {
          select: { id: true, name: true, email: true, profilePic: true, role: true },
        },
        reported: {
          select: { id: true, name: true, email: true, profilePic: true, role: true, accountStatus: true },
        },
        order: {
          select: { id: true, shopName: true, status: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      message: 'Pending reports fetched successfully',
      data: reports,
    });
  } catch (error) {
    console.error('Error fetching pending reports:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateReportStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsedId = parseRouteId(req.params.id);
    if (!parsedId) {
      res.status(400).json({ message: 'Invalid report ID' });
      return;
    }

    const { status } = req.body;
    const validStatuses: ReportStatus[] = ['RESOLVED', 'DISMISSED', 'INVESTIGATING'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ message: `status must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    const report = await prisma.report.findUnique({ where: { id: parsedId } });
    if (!report) {
      res.status(404).json({ message: 'Report not found' });
      return;
    }

    const updated = await prisma.report.update({
      where: { id: parsedId },
      data: { status },
    });

    res.status(200).json({
      message: 'Report status updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── User Account Status ─────────────────────────────────────────────────────

export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsedUserId = parseRouteId(req.params.userId);
    if (!parsedUserId) {
      res.status(400).json({ message: 'Invalid User ID' });
      return;
    }

    const { status, durationHours } = req.body;
    const validStatuses: AccountStatus[] = ['ACTIVE', 'SUSPENDED', 'BANNED'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ message: `status must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: parsedUserId } });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Prevent admins from modifying their own status
    if (req.user?.id === parsedUserId) {
      res.status(403).json({ message: 'Forbidden: Cannot modify your own account status' });
      return;
    }

    let suspendedUntil: Date | null = null;
    if (status === 'SUSPENDED') {
      const hours = Number(durationHours);
      if (Number.isNaN(hours) || hours <= 0) {
        res.status(400).json({ message: 'durationHours must be a positive number when status is SUSPENDED' });
        return;
      }
      suspendedUntil = new Date(Date.now() + hours * 60 * 60 * 1000);
    }

    // Cancel any active orders for suspended/banned users
    if (status === 'SUSPENDED' || status === 'BANNED') {
      const activeOrders = await prisma.order.findMany({
        where: {
          OR: [
            { userId: parsedUserId },
            { driverId: parsedUserId },
          ],
          status: {
            notIn: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
          },
        },
      });

      const nowIso = new Date().toISOString();
      for (const order of activeOrders) {
        const cancelReason = order.userId === parsedUserId
          ? 'Pesanan dibatalkan otomatis karena akun pembeli ditangguhkan/diblokir oleh Admin.'
          : 'Pesanan dibatalkan otomatis karena akun driver ditangguhkan/diblokir oleh Admin.';

        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.CANCELLED,
            cancelledBy: CancelledBy.SYSTEM,
            cancelReason,
            stepTimestamps: mergeStepTimestamps(order.stepTimestamps, 'CANCELLED', nowIso),
          },
        });
      }
    }

    const updated = await prisma.user.update({
      where: { id: parsedUserId },
      data: { 
        accountStatus: status,
        suspendedUntil: status === 'SUSPENDED' ? suspendedUntil : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        accountStatus: true,
        suspendedUntil: true,
      },
    });

    res.status(200).json({
      message: 'User account status updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        accountStatus: true,
        suspendedUntil: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      message: 'Users fetched successfully',
      data: users,
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
