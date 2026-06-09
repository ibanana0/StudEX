import { useQuery } from '@tanstack/react-query';
import api from '@/utils/api';
import type { Order, OrderStatus } from '@/types';

const TERMINAL_STATUSES: OrderStatus[] = ['COMPLETED', 'CANCELLED'];

export function useOrderPolling(orderId: number | null) {
  return useQuery<Order>({
    queryKey: ['order', orderId],
    queryFn: () => api.get(`/orders/${orderId}`).then((r) => r.data),
    enabled: !!orderId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (!status || TERMINAL_STATUSES.includes(status)) return false;
      return 5000;
    },
  });
}
