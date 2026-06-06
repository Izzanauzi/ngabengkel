import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { baseFetch } from '../utils/baseFetch'; 
import { Mekanik, MekanikRequest, ApiResponse } from '../@types/mekanik';

const MEKANIK_KEYS = {
  all: ['mekanik'] as const,
};

// 1. GET ALL
export function useGetAllMekanik() {
  return useQuery<Mekanik[]>({
    queryKey: MEKANIK_KEYS.all,
    queryFn: async () => {
      // Kita pakai format ApiResponse<Mekanik[]> karena dari backend dibungkus
      const response = await baseFetch<ApiResponse<Mekanik[]>>({
        method: 'GET',
        url: '/mekanik',
      });
      // Kita "bongkar" dan langsung return isinya saja (array) agar UI tidak error
      return response.data;
    }
  });
}

// 2. POST
export function useCreateMekanik() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: MekanikRequest) => {
      const response = await baseFetch<ApiResponse<Mekanik>>({
        method: 'POST',
        url: '/mekanik',
        options: { data }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEKANIK_KEYS.all });
    },
  });
}

// 3. PUT
export function useUpdateMekanik() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: MekanikRequest }) => {
      const response = await baseFetch<ApiResponse<Mekanik>>({
        method: 'PUT',
        url: `/mekanik/${id}`,
        options: { data }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEKANIK_KEYS.all });
    },
  });
}

// 4. DELETE
export function useDeleteMekanik() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await baseFetch<ApiResponse<any>>({
        method: 'DELETE',
        url: `/mekanik/${id}`,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEKANIK_KEYS.all });
    },
  });
}