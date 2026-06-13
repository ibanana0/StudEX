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
      estItemPrice,
      deliveryFee,
      buyerLat,
      buyerLng,
    } = req.body;

    if (
      !shopName ||
      itemsDescription === undefined ||
      estItemPrice === undefined ||
      deliveryFee === undefined ||
      buyerLat === undefined ||
      buyerLng === undefined
    ) {
      res.status(400).json({
        message: 'shopName, itemsDescription, estItemPrice, deliveryFee, buyerLat, and buyerLng are required',
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

    const estItemPriceNum = Number(estItemPrice);
    const deliveryFeeNum = Number(deliveryFee);
    const buyerLatNum = Number(buyerLat);
    const buyerLngNum = Number(buyerLng);

    if (Number.isNaN(estItemPriceNum) || estItemPriceNum < 0) {
      res.status(400).json({ message: 'estItemPrice must be a non-negative number' });
      return;
    }

    if (Number.isNaN(deliveryFeeNum) || deliveryFeeNum < 1000) {
      res.status(400).json({ message: 'deliveryFee must be at least Rp1.000' });
      return;
    }

    if (Number.isNaN(buyerLatNum) || Number.isNaN(buyerLngNum)) {
      res.status(400).json({ message: 'buyerLat and buyerLng must be valid numbers' });
      return;
    }

    if (!req.user?.id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const totalPrice = estItemPriceNum + deliveryFeeNum;

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        shopName: String(shopName).trim(),
        itemsDescription: itemsDescription as unknown as Prisma.InputJsonValue,
        notes: typeof notes === 'string' && notes.trim().length > 0 ? notes.trim() : null,
        estItemPrice: estItemPriceNum,
        deliveryFee: deliveryFeeNum,
        totalPrice,
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
