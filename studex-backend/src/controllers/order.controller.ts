import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { OrderStatus, CancelledBy } from '@prisma/client';

interface OrderItem {
  name: string;
  qty: number;
  note?: string;
}

function validateItemsDescription(items: unknown): items is OrderItem[] {
  if (!Array.isArray(items) || items.length === 0) return false;
  return items.every(
    (item) =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as any).name === 'string' &&
      (item as any).name.trim().length > 0 &&
      typeof (item as any).qty === 'number' &&
      Number.isInteger((item as any).qty) &&
      (item as any).qty >= 1 &&
      ((item as any).note === undefined || typeof (item as any).note === 'string')
  );
}

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = parseInt(req.params.id, 10);
    if (isNaN(orderId)) {
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

    // Only the buyer or the assigned driver may view the order
    const userId = req.user!.id;
    if (order.userId !== userId && order.driverId !== userId) {
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

    if (isNaN(estItemPriceNum) || estItemPriceNum < 0) {
      res.status(400).json({ message: 'estItemPrice must be a non-negative number' });
      return;
    }

    if (isNaN(deliveryFeeNum) || deliveryFeeNum < 1000) {
      res.status(400).json({ message: 'deliveryFee must be at least Rp1.000' });
      return;
    }

    if (isNaN(buyerLatNum) || isNaN(buyerLngNum)) {
      res.status(400).json({ message: 'buyerLat and buyerLng must be valid numbers' });
      return;
    }

    const totalPrice = estItemPriceNum + deliveryFeeNum;

    const order = await prisma.order.create({
      data: {
        userId: req.user!.id,
        shopName: String(shopName).trim(),
        itemsDescription,
        notes: notes ? String(notes).trim() : null,
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
    const orderId = parseInt(req.params.id, 10);
    if (isNaN(orderId)) {
      res.status(400).json({ message: 'Invalid order ID' });
      return;
    }

    const { cancelReason } = req.body;

    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    if (order.userId !== req.user!.id) {
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
        cancelReason: cancelReason ? String(cancelReason).trim() : null,
        updatedAt: new Date(),
      },
    });

    res.status(200).json({ message: 'Order cancelled successfully', data: cancelled });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
