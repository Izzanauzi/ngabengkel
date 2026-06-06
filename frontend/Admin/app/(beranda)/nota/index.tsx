import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router'; // Ditambahkan untuk navigasi dan parameter route

// Import Hooks API
import { useGetNotaPreview, useConfirmPayment } from '../../../src/hooks/nota.hooks';

// Fungsi helper untuk format Rupiah
const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(angka);
};

export default function NotaTagihanScreen() {
  // 1. Ambil ID WO dari parameter rute (contoh: /nota?wo_id=123)
  const { wo_id } = useLocalSearchParams<{ wo_id: string }>();
  
  // 2. State Pembayaran (Disamakan dengan value enum backend)
  const [paymentMethod, setPaymentMethod] = useState('tunai');

  // 3. Panggil API Hooks
  const { data: notaData, isLoading, isError } = useGetNotaPreview(wo_id);
  const confirmMutation = useConfirmPayment();

  // 4. Handle Konfirmasi Pembayaran
  const handleConfirm = () => {
    if (!wo_id) {
      Alert.alert('Error', 'ID Work Order tidak ditemukan.');
      return;
    }

    Alert.alert(
      "Konfirmasi Pembayaran",
      "Apakah customer sudah membayar sesuai tagihan?",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Ya, Sudah", 
          onPress: () => {
            confirmMutation.mutate(
              { wo_id: wo_id, data: { metode_pembayaran: paymentMethod } },
              {
                onSuccess: () => {
                  Alert.alert('Berhasil', 'Pembayaran telah dikonfirmasi dan WO berstatus Lunas.', [
                    { text: 'OK', onPress: () => router.back() } // Kembali ke halaman sebelumnya
                  ]);
                },
                onError: () => {
                  Alert.alert('Gagal', 'Terjadi kesalahan saat konfirmasi pembayaran.');
                }
              }
            );
          } 
        }
      ]
    );
  };

  // Komponen Reusable untuk Radio Button
  const RadioButton = ({ label, value, selected, onPress }: { label: string, value: string, selected: boolean, onPress: () => void }) => (
    <TouchableOpacity style={styles.radioContainer} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.outerCircle, selected && styles.selectedOuterCircle]}>
        {selected && <View style={styles.innerCircle} />}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nota Tagihan</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* State Render: Loading, Error, atau Data */}
        {isLoading ? (
           <ActivityIndicator size="large" color="#1a73e8" style={{ marginTop: 50 }} />
        ) : isError || !notaData ? (
           <View style={{ alignItems: 'center', marginTop: 50 }}>
             <Text style={{ color: 'red', marginBottom: 10 }}>Gagal memuat atau ID WO tidak valid.</Text>
             <Text style={{ color: '#888' }}>(Pastikan masuk ke halaman ini dari list Work Order)</Text>
           </View>
        ) : (
          <>
            {/* KARTU 1: INFO WORK ORDER */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <View>
                  <Text style={styles.woNumber}>{notaData.nomor_wo}</Text>
                  <Text style={styles.notaNumber}>Tagihan Pembayaran</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>Menunggu Pembayaran</Text>
                </View>
              </View>

              <Text style={styles.infoLabel}>Customer</Text>
              <Text style={styles.infoValue}>{notaData.customer.nama}</Text>

              <Text style={styles.infoLabel}>Telepon</Text>
              <Text style={styles.infoValue}>{notaData.customer.telepon}</Text>

              <Text style={styles.infoLabel}>Kendaraan</Text>
              <Text style={styles.infoValue}>
                {notaData.kendaraan.merek} {notaData.kendaraan.model} · {notaData.kendaraan.nomor_polisi}
              </Text>
              
              {/* Tanggal menggunakan tanggal saat ini sebagai simulasi hari H pembayaran */}
              <Text style={styles.infoLabel}>Tanggal Pembuatan Nota</Text>
              <Text style={styles.infoValue}>
                {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
              </Text>
            </View>

            {/* KARTU 2: RINCIAN BIAYA */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>RINCIAN BIAYA</Text>
              
              {/* Looping data material/sparepart */}
              {notaData.items && notaData.items.map((item) => (
                <View style={styles.costItemRow} key={item.wo_item_id}>
                  <Text style={styles.costItemName}>{item.nama_item} × {item.jumlah}</Text>
                  <Text style={styles.costItemPrice}>{formatRupiah(item.subtotal)}</Text>
                </View>
              ))}

              {/* Data Jasa Servis */}
              <View style={styles.costItemRow}>
                <Text style={styles.costItemName}>Biaya Jasa Mekanik</Text>
                <Text style={styles.costItemPrice}>{formatRupiah(notaData.biaya_jasa)}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.subtotalRow}>
                <Text style={styles.subtotalLabel}>Total Sparepart</Text>
                <Text style={styles.subtotalValue}>{formatRupiah(notaData.total_material)}</Text>
              </View>

              <View style={styles.thickDivider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Grand Total</Text>
                <Text style={styles.totalValue}>{formatRupiah(notaData.total_biaya)}</Text>
              </View>
            </View>

            {/* KARTU 3: METODE PEMBAYARAN */}
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
                value="transfer_bank"
                selected={paymentMethod === 'transfer_bank'} 
                onPress={() => setPaymentMethod('transfer_bank')} 
              />
              <RadioButton 
                label="QRIS / E-Wallet" 
                value="qris"
                selected={paymentMethod === 'qris'} 
                onPress={() => setPaymentMethod('qris')} 
              />

              {/* TOMBOL KONFIRMASI PEMBAYARAN */}
              <TouchableOpacity 
                style={styles.btnConfirm} 
                onPress={handleConfirm}
                disabled={confirmMutation.isPending}
              >
                {confirmMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnConfirmText}>Konfirmasi Pembayaran</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ... COPY STYLES DARI FILE LAMA KE SINI ...
// (Style-nya sama persis seperti file Anda, jadi tidak saya tulis ulang untuk menghemat ruang, Anda cukup paste styles Anda di bawah sini).
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  headerContainer: {
    backgroundColor: '#1a73e8',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
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
  woNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  notaNumber: {
    fontSize: 13,
    color: '#888',
  },
  statusBadge: {
    backgroundColor: '#fef5e7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusBadgeText: {
    color: '#d98a2c',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
    marginTop: 12,
  },
  infoValue: {
    fontSize: 15,
    color: '#222',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#888',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  costItemRow: {
    marginBottom: 14,
  },
  costItemName: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  costItemPrice: {
    fontSize: 15,
    color: '#222',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  thickDivider: {
    height: 1.5,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  subtotalLabel: {
    fontSize: 14,
    color: '#666',
  },
  subtotalValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
  },
  discountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  discountLabel: {
    fontSize: 14,
    color: '#666',
  },
  discountValue: {
    fontSize: 15,
    color: '#222',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a73e8',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
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
  selectedOuterCircle: {
    borderColor: '#1a73e8',
  },
  innerCircle: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#1a73e8',
  },
  radioLabel: {
    fontSize: 15,
    color: '#333',
  },
  btnConfirm: {
    backgroundColor: '#1a73e8',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  btnConfirmText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});