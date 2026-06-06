import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { baseFetch } from '../utils/baseFetch';
import { Customer, UpdateCustomerRequest, ApiResponse } from '../@types/customer';

const CUSTOMER_KEYS = {
  all: ['customers'] as const,
};

// 1. GET ALL
// Kita bisa mengirim parameter 'q' untuk pencarian sesuai docs API
export function useGetAllCustomer(searchQuery: string = '') {
  return useQuery<Customer[]>({
    // Cache key berubah jika searchQuery berubah
    queryKey: [...CUSTOMER_KEYS.all, searchQuery],
    queryFn: async () => {
      const url = searchQuery ? `/customers?q=${searchQuery}` : '/customers';
      const response = await baseFetch<ApiResponse<Customer[]>>({
        method: 'GET',
        url: url,
      });
      return response.data;
    }
  });
}

// 2. PUT (Edit Customer)
export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCustomerRequest }) => {
      const response = await baseFetch<ApiResponse<Customer>>({
        method: 'PUT',
        url: `/customers/${id}`,
        options: { data }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_KEYS.all });
    },
  });
}

// 3. DELETE
export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await baseFetch<ApiResponse<any>>({
        method: 'DELETE',
        url: `/customers/${id}`,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_KEYS.all });
    },
  });
}