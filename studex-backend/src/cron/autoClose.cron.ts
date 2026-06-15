import cron from 'node-cron';
import prisma from '../config/prisma';

// Jalankan setiap menit
const autoCloseJob = cron.schedule('* * * * *', async () => {
  try {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    const result = await prisma.order.updateMany({
      where: {
        status: 'PESANAN_TIBA',
        updatedAt: {
          lt: fifteenMinutesAgo,
        },
      },
      data: {
        status: 'COMPLETED',
      },
    });

    if (result.count > 0) {
      console.log(`[Cron] Auto-closed ${result.count} orders with status PESANAN_TIBA`);
    }
  } catch (error) {
    console.error('[Cron] Error in autoCloseJob:', error);
  }
});

export default autoCloseJob;
