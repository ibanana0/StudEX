import cron from 'node-cron';
import prisma from '../config/prisma';
import { OrderStatus, CancelledBy } from '@prisma/client';

// Jalankan setiap menit
const autoCancelJob = cron.schedule('* * * * *', async () => {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const result = await prisma.order.updateMany({
      where: {
        status: OrderStatus.MENCARI_DRIVER,
        updatedAt: {
          lt: thirtyMinutesAgo,
        },
      },
      data: {
        status: OrderStatus.CANCELLED,
        cancelledBy: CancelledBy.SYSTEM,
        cancelReason: 'Tidak ada driver yang mengambil pesanan ini setelah 30 menit.',
      },
    });

    if (result.count > 0) {
      console.log(`[Cron] Auto-cancelled ${result.count} orders that remained in MENCARI_DRIVER for over 30 minutes`);
    }
  } catch (error) {
    console.error('[Cron] Error in autoCancelJob:', error);
  }
});

export default autoCancelJob;
