import React from 'react';
import { Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';

import HistoryCard from '../../../src/components/history/HistoryCard';
import EmptyState from '../../../src/components/history/EmptyState';
import RequireAuth from '../../../src/components/auth/requireAuth';
import { useGetHistory } from '../../../src/hooks/workorder.hooks';
import { formatRupiah } from '../../../src/utils/helper';

const formatTanggal = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

export default function HistoryScreen() {
  const { history, isLoading, refetch } = useGetHistory();

  return (
    <RequireAuth>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} colors={["#1565C0"]} />
        }
      >
        {/* HEADER */}
        <Text style={styles.title}>Riwayat Servis</Text>
        <Text style={styles.subtitle}>Riwayat semua servis kendaraan Anda</Text>

        {isLoading ? (
          <ActivityIndicator color="#1565C0" style={{ marginTop: 40 }} size="large" />
        ) : history.length > 0 ? (
          history.map((item) => {
            const kendaraanLabel = item.kendaraan
              ? `${item.kendaraan.merek} ${item.kendaraan.model}`
              : "Kendaraan";
            
            // Proses array service menjadi string agar aman dibaca oleh komponen Text di HistoryCard
            const servicesArray = item.deskripsi_kerusakan
              ? [item.deskripsi_kerusakan]
              : item.items?.map((i) => i.nama_item) ?? [];
            const services = servicesArray.join(", ");

            // Kalkulasi total biaya
            const total = (item.biaya_jasa || 0) + (item.items ?? []).reduce((s, i) => s + i.subtotal, 0);

            return (
              <HistoryCard
                key={item.wo_id}
                title={kendaraanLabel}
                code={item.nomor_wo}
                services={services}
                date={formatTanggal(item.created_at)}
                price={formatRupiah(total)}
                status={item.status === "lunas" ? "Lunas" : "Selesai"}
                onPress={() => router.push(`/(beranda)/services/${item.wo_id}`)}
              />
            );
          })
        ) : (
          <EmptyState />
        )}
      </ScrollView>
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#777',
    marginBottom: 16,
  },
});