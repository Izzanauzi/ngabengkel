import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { baseFetch } from '../utils/baseFetch';
import { Nota, Transaction, ConfirmPaymentRequest, ApiResponse } from '../@types/nota';

const NOTA_KEYS = {
  detail: (wo_id: string) => ['nota', wo_id] as const,
};

// 1. GET: Ambil Preview Nota Tagihan berdasarkan ID Work Order
export function useGetNotaPreview(wo_id: string | undefined) {
  return useQuery<Nota>({
    queryKey: NOTA_KEYS.detail(wo_id || ''),
    // Hanya fetch kalau wo_id tersedia
    enabled: !!wo_id,
    queryFn: async () => {
      const response = await baseFetch<ApiResponse<Nota>>({
        method: 'GET',
        url: `/work-orders/${wo_id}/nota`,
      });
      return response.data;
    }
  });
}

// 2. POST: Konfirmasi Pembayaran
export function useConfirmPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ wo_id, data }: { wo_id: string; data: ConfirmPaymentRequest }) => {
      const response = await baseFetch<ApiResponse<Transaction>>({
        method: 'POST',
        url: `/work-orders/${wo_id}/payment`,
        options: { data }
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Refresh data nota setelah pembayaran sukses
      queryClient.invalidateQueries({ queryKey: NOTA_KEYS.detail(variables.wo_id) });
      // Jika nanti Anda punya halaman list WO, refresh juga list WO-nya
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
    },
  });
}