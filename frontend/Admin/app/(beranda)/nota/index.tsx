import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  useGetWorkOrderById,
  useConfirmPaymentMutation,
} from '../../../src/hooks/work_order.hooks';

function formatRupiah(n: number): string {
  return `Rp ${n.toLocaleString('id-ID')}`;
}

function formatTanggal(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function NotaTagihanScreen() {
  const { wo_id } = useLocalSearchParams<{ wo_id: string }>();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState('tunai');
  const [payError, setPayError] = useState<string | null>(null);

  const { workOrder, isLoading } = useGetWorkOrderById(wo_id);

  const { confirmPaymentMutation } = useConfirmPaymentMutation({
    onSuccess: () => router.back(),
    onError: (msg) => setPayError(msg),
  });

  const totalMaterial =
    workOrder?.items?.reduce((sum, item) => sum + item.subtotal, 0) ?? 0;
  const totalBiaya = (workOrder?.biaya_jasa ?? 0) + totalMaterial;

  const RadioButton = ({
    label,
    value,
    selected,
    onPress,
  }: {
    label: string;
    value: string;
    selected: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.radioContainer} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.outerCircle, selected && styles.selectedOuterCircle]}>
        {selected && <View style={styles.innerCircle} />}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );

  if (!wo_id) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerBox}>
          <Text style={styles.emptyText}>Work Order tidak ditemukan</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#1a73e8" />
        </View>
      </SafeAreaView>
    );
  }

  if (!workOrder) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerBox}>
          <Text style={styles.emptyText}>Data WO tidak ditemukan</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isLunas = workOrder.status === 'lunas';
  const customerName = workOrder.user?.nama ?? '-';
  const vehicleLabel = workOrder.kendaraan
    ? `${workOrder.kendaraan.merek} ${workOrder.kendaraan.model} · ${workOrder.kendaraan.nomor_polisi}`
    : '-';
  const mekanikName = workOrder.mekanik?.nama ?? '-';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nota Tagihan</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* KARTU INFO WORK ORDER */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.woNumber}>{workOrder.nomor_wo ?? workOrder.wo_id}</Text>
            </View>
            <View style={[styles.statusBadge, isLunas && styles.statusBadgeLunas]}>
              <Text style={[styles.statusBadgeText, isLunas && styles.statusBadgeTextLunas]}>
                {isLunas ? 'Lunas' : 'Belum Lunas'}
              </Text>
            </View>
          </View>

          <Text style={styles.infoLabel}>Customer</Text>
          <Text style={styles.infoValue}>{customerName}</Text>

          <Text style={styles.infoLabel}>Kendaraan</Text>
          <Text style={styles.infoValue}>{vehicleLabel}</Text>

          <Text style={styles.infoLabel}>Mekanik</Text>
          <Text style={styles.infoValue}>{mekanikName}</Text>

          {workOrder.tanggal_selesai && (
            <>
              <Text style={styles.infoLabel}>Tanggal Selesai</Text>
              <Text style={styles.infoValue}>{formatTanggal(workOrder.tanggal_selesai)}</Text>
            </>
          )}
        </View>

        {/* RINCIAN BIAYA */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>RINCIAN BIAYA</Text>

          {(workOrder.biaya_jasa ?? 0) > 0 && (
            <View style={styles.costItemRow}>
              <Text style={styles.costItemName}>Biaya Jasa</Text>
              <Text style={styles.costItemPrice}>{formatRupiah(workOrder.biaya_jasa!)}</Text>
            </View>
          )}

          {(workOrder.items ?? []).map((item, idx) => (
            <View key={item.item_id ?? idx} style={styles.costItemRow}>
              <Text style={styles.costItemName}>
                {item.nama_barang} × {item.jumlah}
              </Text>
              <Text style={styles.costItemPrice}>{formatRupiah(item.subtotal)}</Text>
            </View>
          ))}

          {(workOrder.items ?? []).length === 0 && (workOrder.biaya_jasa ?? 0) === 0 && (
            <Text style={styles.emptyText}>Belum ada rincian biaya</Text>
          )}

          <View style={styles.thickDivider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatRupiah(totalBiaya)}</Text>
          </View>
        </View>

        {/* METODE PEMBAYARAN — hanya jika belum lunas */}
        {!isLunas && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>METODE PEMBAYARAN</Text>

            <RadioButton
              label="Tunai"
              value="tunai"
              selected={paymentMethod === 'tunai'}
              onPress={() => setPaymentMethod('tunai')}
            />
            <RadioButton
              label="Transfer Bank"
              value="transfer"
              selected={paymentMethod === 'transfer'}
              onPress={() => setPaymentMethod('transfer')}
            />
            <RadioButton
              label="QRIS"
              value="qris"
              selected={paymentMethod === 'qris'}
              onPress={() => setPaymentMethod('qris')}
            />

            {!!payError && (
              <Text style={{ color: '#DC2626', fontSize: 13, marginBottom: 10, textAlign: 'center' }}>
                {payError}
              </Text>
            )}

            <TouchableOpacity
              style={[
                styles.btnConfirm,
                confirmPaymentMutation.isPending && { opacity: 0.6 },
              ]}
              onPress={() => {
                setPayError(null);
                confirmPaymentMutation.mutate({
                  woId: workOrder.wo_id,
                  metode_pembayaran: paymentMethod,
                  total_biaya: totalBiaya,
                });
              }}
              disabled={confirmPaymentMutation.isPending}
            >
              <Text style={styles.btnConfirmText}>
                {confirmPaymentMutation.isPending ? 'Memproses...' : 'Konfirmasi Pembayaran'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerContainer: {
    backgroundColor: '#1a73e8',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  backButton: { marginRight: 15 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  content: { flex: 1 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  woNumber: { fontSize: 16, fontWeight: 'bold', color: '#222', marginBottom: 4 },
  statusBadge: {
    backgroundColor: '#fef5e7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusBadgeLunas: { backgroundColor: '#e6f6ec' },
  statusBadgeText: { color: '#d98a2c', fontSize: 12, fontWeight: 'bold' },
  statusBadgeTextLunas: { color: '#1ea446' },
  infoLabel: { fontSize: 12, color: '#888', marginBottom: 4, marginTop: 12 },
  infoValue: { fontSize: 15, color: '#222' },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#888',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  costItemRow: { marginBottom: 14 },
  costItemName: { fontSize: 13, color: '#666', marginBottom: 4 },
  costItemPrice: { fontSize: 15, color: '#222' },
  thickDivider: { height: 1.5, backgroundColor: '#e0e0e0', marginVertical: 12 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#1a73e8' },
  radioContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  outerCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectedOuterCircle: { borderColor: '#1a73e8' },
  innerCircle: { height: 10, width: 10, borderRadius: 5, backgroundColor: '#1a73e8' },
  radioLabel: { fontSize: 15, color: '#333' },
  btnConfirm: {
    backgroundColor: '#1a73e8',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  btnConfirmText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  emptyText: { color: '#aaa', fontSize: 14, textAlign: 'center', paddingVertical: 8 },
});
