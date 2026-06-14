import { Request, Response } from 'express';
import { Prisma, CancelledBy, OrderStatus } from '@prisma/client';
import prisma from '../config/prisma';

interface OrderItem {
  name: string;
  qty: number;
  note?: string;
}

function parseRouteId(rawId: string | string[] | undefined): number | null {
  const routeValue = Array.isArray(rawId) ? rawId[0] : rawId;
  const parsed = Number.parseInt(routeValue ?? '', 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function validateItemsDescription(items: unknown): items is OrderItem[] {
  if (!Array.isArray(items) || items.length === 0) {
    return false;
  }

  return items.every(
    (item) =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as { name?: unknown }).name === 'string' &&
      (item as { name: string }).name.trim().length > 0 &&
      typeof (item as { qty?: unknown }).qty === 'number' &&
      Number.isInteger((item as { qty: number }).qty) &&
      (item as { qty: number }).qty >= 1 &&
      ((item as { note?: unknown }).note === undefined || typeof (item as { note?: unknown }).note === 'string')
  );
}

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = parseRouteId(req.params.id);

    if (!orderId) {
      res.status(400).json({ message: 'Invalid order ID' });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: {
          select: { id: true, name: true, profilePic: true, phoneNumber: true },
        },
        driver: {
          select: {
            id: true,
            name: true,
            profilePic: true,
            phoneNumber: true,
            driverProfile: { select: { avgRating: true, qrisUrl: true } },
          },
        },
      },
    });

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    const userId = req.user?.id;
    if (!userId || (order.userId !== userId && order.driverId !== userId)) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      shopName,
      itemsDescription,
      notes,
      buyerLat,
      buyerLng,
    } = req.body;

    if (
      !shopName ||
      itemsDescription === undefined ||
      buyerLat === undefined ||
      buyerLng === undefined
    ) {
      res.status(400).json({
        message: 'shopName, itemsDescription, buyerLat, and buyerLng are required',
      });
      return;
    }

    if (!validateItemsDescription(itemsDescription)) {
      res.status(400).json({
        message:
          'itemsDescription must be a non-empty array of objects: [{ name: string, qty: integer >= 1, note?: string }]',
      });
      return;
    }

    const buyerLatNum = Number(buyerLat);
    const buyerLngNum = Number(buyerLng);

    if (Number.isNaN(buyerLatNum) || Number.isNaN(buyerLngNum)) {
      res.status(400).json({ message: 'buyerLat and buyerLng must be valid numbers' });
      return;
    }

    if (!req.user?.id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        shopName: String(shopName).trim(),
        itemsDescription: itemsDescription as unknown as Prisma.InputJsonValue,
        notes: typeof notes === 'string' && notes.trim().length > 0 ? notes.trim() : null,
        buyerLat: buyerLatNum,
        buyerLng: buyerLngNum,
        status: OrderStatus.MENCARI_DRIVER,
      },
    });

    res.status(201).json({ message: 'Order created successfully', data: order });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = parseRouteId(req.params.id);

    if (!orderId) {
      res.status(400).json({ message: 'Invalid order ID' });
      return;
    }

    if (!req.user?.id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const cancelReason =
      typeof req.body.cancelReason === 'string' && req.body.cancelReason.trim().length > 0
        ? req.body.cancelReason.trim()
        : null;

    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    if (order.userId !== req.user.id) {
      res.status(403).json({ message: 'Forbidden: You do not own this order' });
      return;
    }

    if (order.status !== OrderStatus.MENCARI_DRIVER) {
      res.status(409).json({
        message: 'Order cannot be cancelled: a driver has already accepted this order',
        currentStatus: order.status,
      });
      return;
    }

    const cancelled = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELLED,
        cancelledBy: CancelledBy.USER,
        cancelReason,
      },
    });

    res.status(200).json({ message: 'Order cancelled successfully', data: cancelled });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getDriverOrderPool = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (req.user.role !== 'DRIVER') {
      res.status(403).json({ message: 'Forbidden: Only verified drivers can view the order pool' });
      return;
    }

    const orders = await prisma.order.findMany({
      where: {
        status: OrderStatus.MENCARI_DRIVER,
      },
      include: {
        buyer: {
          select: { id: true, name: true, profilePic: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({ data: orders });
  } catch (error) {
    console.error('Get driver order pool error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const claimOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = parseRouteId(req.params.id);

    if (!orderId) {
      res.status(400).json({ message: 'Invalid order ID' });
      return;
    }

    if (!req.user?.id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (req.user.role !== 'DRIVER') {
      res.status(403).json({ message: 'Forbidden: Only verified drivers can claim orders' });
      return;
    }

    // Cek apakah driver masih punya orderan aktif yang belum selesai
    const activeOrder = await prisma.order.findFirst({
      where: {
        driverId: req.user.id,
        status: {
          in: [
            OrderStatus.DIPROSES_DRIVER,
            OrderStatus.DALAM_PERJALANAN,
            OrderStatus.DRIVER_SAMPAI,
            OrderStatus.PESANAN_TIBA,
          ],
        },
      },
    });

    if (activeOrder) {
      res.status(400).json({ message: 'Anda masih memiliki pesanan aktif yang belum diselesaikan.' });
      return;
    }

    const result = await prisma.order.updateMany({
      where: {
        id: orderId,
        driverId: null,
        status: OrderStatus.MENCARI_DRIVER,
      },
      data: {
        driverId: req.user.id,
        status: OrderStatus.DIPROSES_DRIVER,
      },
    });

    if (result.count === 0) {
      res.status(409).json({ message: 'Conflict: Order already taken or not available' });
      return;
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    res.status(200).json({ message: 'Order claimed successfully', data: order });
  } catch (error) {
    console.error('Claim order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = parseRouteId(req.params.id);
    const { status } = req.body;

    if (!orderId) {
      res.status(400).json({ message: 'Invalid order ID' });
      return;
    }

    if (!status) {
      res.status(400).json({ message: 'Status is required' });
      return;
    }

    if (!req.user?.id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    if (order.driverId !== req.user.id) {
      res.status(403).json({ message: 'Forbidden: You are not the driver for this order' });
      return;
    }

    const validTransitions: Record<string, OrderStatus> = {
      [OrderStatus.DIPROSES_DRIVER]: OrderStatus.DALAM_PERJALANAN,
      [OrderStatus.DALAM_PERJALANAN]: OrderStatus.DRIVER_SAMPAI,
    };

    const nextStatus = validTransitions[order.status];

    if (!nextStatus || nextStatus !== status) {
      res.status(400).json({ 
        message: 'Invalid status transition', 
        currentStatus: order.status, 
        expectedNextStatus: nextStatus || 'None (already at PESANAN_TIBA or invalid)' 
      });
      return;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: nextStatus },
    });

    res.status(200).json({ message: 'Order status updated successfully', data: updatedOrder });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
