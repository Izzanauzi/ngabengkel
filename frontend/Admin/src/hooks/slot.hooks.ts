import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { baseFetch } from '../utils/baseFetch';
import { Slot, SlotAdminResponse, UpdateSlotRequest, AssignSlotRequest, ApiResponse } from '../@types/slot';

const SLOT_KEYS = {
  all: ['slots'] as const,
};

// 1. GET ALL SLOTS & ANTRIAN (Admin)
export function useGetAdminSlots() {
  return useQuery<SlotAdminResponse>({
    queryKey: SLOT_KEYS.all,
    queryFn: async () => {
      const response = await baseFetch<ApiResponse<SlotAdminResponse>>({
        method: 'GET',
        url: '/slots',
      });
      return response.data;
    }
  });
}

// 2. PUT (Update Status Slot Manual)
export function useUpdateSlotStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSlotRequest }) => {
      const response = await baseFetch<ApiResponse<Slot>>({
        method: 'PUT',
        url: `/slots/${id}/status`,
        options: { data }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SLOT_KEYS.all });
    },
  });
}

// 3. POST (Assign WO ke Slot)
export function useAssignSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AssignSlotRequest) => {
      const response = await baseFetch<ApiResponse<any>>({
        method: 'POST',
        url: '/slots/assign',
        options: { data }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SLOT_KEYS.all });
    },
  });
}