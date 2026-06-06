import { useState, useEffect, useCallback } from 'react';
import { baseFetch } from '../utils/baseFetch';
import { InventoryItem, InventoryRequest, InventoryTipe } from '../@types/inventori.types';

// ── GET /inventory ─────────────────────────────────────────────────────────────

export const useInventory = (tipe?: InventoryTipe) => {
  const [data, setData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await baseFetch<InventoryItem[]>({
        url: '/admin/inventory',
        method: 'GET',
        params: tipe ? { tipe } : undefined,
      });
      setData(result ?? []);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Gagal memuat inventori');
    } finally {
      setLoading(false);
    }
  }, [tipe]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
};

// ── POST /inventory ────────────────────────────────────────────────────────────

export const useAddInventory = () => {
  const [loading, setLoading] = useState(false);

  const addItem = async (payload: InventoryRequest): Promise<InventoryItem | undefined> => {
    setLoading(true);
    try {
      const result = await baseFetch<InventoryItem>({
        url: '/admin/inventory',
        method: 'POST',
        payload,
      });
      return result;
    } finally {
      setLoading(false);
    }
  };

  return { addItem, loading };
};

// ── PUT /inventory/:id ─────────────────────────────────────────────────────────

export const useUpdateInventory = () => {
  const [loading, setLoading] = useState(false);

  const updateItem = async (
    inventory_id: string,
    payload: InventoryRequest
  ): Promise<InventoryItem | undefined> => {
    setLoading(true);
    try {
      const result = await baseFetch<InventoryItem>({
        url: `/admin/inventory/${inventory_id}`,
        method: 'PUT',
        payload,
      });
      return result;
    } finally {
      setLoading(false);
    }
  };

  return { updateItem, loading };
};

// ── DELETE /inventory/:id ──────────────────────────────────────────────────────

export const useDeleteInventory = () => {
  const [loading, setLoading] = useState(false);

  const deleteItem = async (inventory_id: string): Promise<boolean> => {
    setLoading(true);
    try {
      await baseFetch<{ message: string }>({
        url: `/admin/inventory/${inventory_id}`,
        method: 'DELETE',
      });
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteItem, loading };
};