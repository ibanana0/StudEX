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

const TIME_FORMATTER = new Intl.DateTimeFormat('id-ID', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'Asia/Jakarta',
});

function formatLocalTime(value: Date | string | null | undefined): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return TIME_FORMATTER.format(date);
}

function enrichOrder(order: any): any {
  if (!order) return null;

  const orderCode = `STX-${order.id}`;

  const createdTime = new Date(order.createdAt);
  const estTime = new Date(createdTime.getTime() + 30 * 60 * 1000);
  const estimatedTime = formatLocalTime(estTime);

  const deliveryAddress: string | null = order.deliveryAddress ?? null;

  const stored = (order.stepTimestamps ?? {}) as Record<string, string>;
  const stepTimestamps: Record<string, string> = {
    MENCARI_DRIVER: formatLocalTime(createdTime),
  };

  for (const key of [
    'DIPROSES_DRIVER',
    'DRIVER_DI_TOKO',
    'DALAM_PERJALANAN',
    'DRIVER_SAMPAI',
    'PESANAN_TIBA',
    'COMPLETED',
    'CANCELLED',
  ]) {
    if (stored[key]) {
      stepTimestamps[key] = formatLocalTime(stored[key]);
    }
  }

  let driver = null;
  if (order.driver) {
    driver = {
      ...order.driver,
      faculty: order.driver.fakultas || 'Fakultas Teknik',
      phone: order.driver.phoneNumber || '',
      rating: order.driver.driverProfile?.avgRating ? Number(order.driver.driverProfile.avgRating) : 5.0,
      avatarUrl: order.driver.profilePic || null,
    };
  }

  return {
    ...order,
    orderCode,
    estimatedTime,
    deliveryAddress,
    stepTimestamps,
    estItemPrice: 0,
    deliveryFee: 0,
    totalPrice: 0,
    driver,
  };
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
            fakultas: true,
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

    res.status(200).json(enrichOrder(order));
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
      deliveryAddress,
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

    const deliveryAddressClean =
      typeof deliveryAddress === 'string' && deliveryAddress.trim().length > 0
        ? deliveryAddress.trim()
        : null;

    if (!deliveryAddressClean) {
      res.status(400).json({ message: 'deliveryAddress is required' });
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

    const nowIso = new Date().toISOString();
    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        shopName: String(shopName).trim(),
        itemsDescription: itemsDescription as unknown as Prisma.InputJsonValue,
        notes: typeof notes === 'string' && notes.trim().length > 0 ? notes.trim() : null,
        buyerLat: buyerLatNum,
        buyerLng: buyerLngNum,
        deliveryAddress: deliveryAddressClean,
        status: OrderStatus.MENCARI_DRIVER,
        stepTimestamps: { MENCARI_DRIVER: nowIso } as Prisma.InputJsonValue,
      },
    });

    res.status(201).json({ message: 'Order created successfully', data: enrichOrder(order) });
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
        stepTimestamps: mergeStepTimestamps(order.stepTimestamps, 'CANCELLED', new Date().toISOString()),
      },
    });

    res.status(200).json({ message: 'Order cancelled successfully', data: enrichOrder(cancelled) });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

function mergeStepTimestamps(existing: unknown, status: string, iso: string): Prisma.InputJsonValue {
  const base =
    existing && typeof existing === 'object' && !Array.isArray(existing)
      ? { ...(existing as Record<string, string>) }
      : {};
  base[status] = iso;
  return base as Prisma.InputJsonValue;
}

async function isDriverActive(userId: number): Promise<boolean> {
  const profile = await prisma.driverProfile.findUnique({
    where: { userId },
    select: { isActive: true },
  });
  return Boolean(profile?.isActive);
}

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

    if (!(await isDriverActive(req.user.id))) {
      res.status(403).json({ message: 'Driver offline' });
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

    res.status(200).json({ data: orders.map(enrichOrder) });
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

    if (!(await isDriverActive(req.user.id))) {
      res.status(403).json({ message: 'Driver offline' });
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

    const claimed = await prisma.order.findUnique({ where: { id: orderId } });
    await prisma.order.update({
      where: { id: orderId },
      data: {
        stepTimestamps: mergeStepTimestamps(claimed?.stepTimestamps, 'DIPROSES_DRIVER', new Date().toISOString()),
      },
    });

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
            fakultas: true,
            driverProfile: { select: { avgRating: true, qrisUrl: true } },
          },
        },
      },
    });
    res.status(200).json({ message: 'Order claimed successfully', data: enrichOrder(order) });
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

    if (status === OrderStatus.PESANAN_TIBA) {
      if (order.userId !== req.user.id) {
        res.status(403).json({ message: 'Forbidden: Only the buyer can confirm order receipt' });
        return;
      }
      if (order.status !== OrderStatus.DRIVER_SAMPAI) {
        res.status(400).json({
          message: 'Invalid status transition',
          currentStatus: order.status,
          expectedStatus: OrderStatus.DRIVER_SAMPAI,
        });
        return;
      }
    } else {
      if (order.driverId !== req.user.id) {
        res.status(403).json({ message: 'Forbidden: You are not the driver for this order' });
        return;
      }

      const validTransitions: Record<string, OrderStatus> = {
        [OrderStatus.DIPROSES_DRIVER]: OrderStatus.DRIVER_DI_TOKO,
        [OrderStatus.DRIVER_DI_TOKO]: OrderStatus.DALAM_PERJALANAN,
        [OrderStatus.DALAM_PERJALANAN]: OrderStatus.DRIVER_SAMPAI,
        [OrderStatus.PESANAN_TIBA]: OrderStatus.COMPLETED,
      };

      const expectedNextStatus = validTransitions[order.status];

      if (!expectedNextStatus || expectedNextStatus !== status) {
        res.status(400).json({ 
          message: 'Invalid status transition', 
          currentStatus: order.status, 
          expectedNextStatus: expectedNextStatus || 'None (invalid transition)' 
        });
        return;
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: status as OrderStatus,
        stepTimestamps: mergeStepTimestamps(order.stepTimestamps, status as string, new Date().toISOString()),
      },
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
            fakultas: true,
            driverProfile: { select: { avgRating: true, qrisUrl: true } },
          },
        },
      },
    });

    res.status(200).json({ message: 'Order status updated successfully', data: enrichOrder(updatedOrder) });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const role = req.query.role === 'driver' ? 'driver' : 'buyer';

    const rawLimit = req.query.limit;
    let take: number | undefined;
    if (typeof rawLimit === 'string' && rawLimit.length > 0) {
      const parsed = Number.parseInt(rawLimit, 10);
      if (Number.isInteger(parsed) && parsed > 0) {
        take = parsed;
      }
    }

    const orders = await prisma.order.findMany({
      where: role === 'driver' ? { driverId: userId } : { userId: userId },
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
            fakultas: true,
            driverProfile: { select: { avgRating: true, qrisUrl: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      ...(take ? { take } : {}),
    });

    res.status(200).json({ data: orders.map(enrichOrder) });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getActiveOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const role = req.query.role === 'driver' ? 'driver' : 'buyer';

    const order = await prisma.order.findFirst({
      where: {
        ...(role === 'driver' ? { driverId: userId } : { userId }),
        status: {
          notIn: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
        },
      },
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
            fakultas: true,
            driverProfile: { select: { avgRating: true, qrisUrl: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.status(200).json({ data: order ? enrichOrder(order) : null });
  } catch (error) {
    console.error('Get active order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPoolOrderById = async (req: Request, res: Response): Promise<void> => {
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
      res.status(403).json({ message: 'Forbidden: Only drivers can view pool detail' });
      return;
    }

    if (!(await isDriverActive(req.user.id))) {
      res.status(403).json({ message: 'Driver offline' });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: {
          select: { id: true, name: true, profilePic: true, phoneNumber: true },
        },
      },
    });

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    if (order.status !== OrderStatus.MENCARI_DRIVER) {
      res.status(409).json({ message: 'Order no longer available', currentStatus: order.status });
      return;
    }

    res.status(200).json({ data: enrichOrder(order) });
  } catch (error) {
    console.error('Get pool order by id error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

